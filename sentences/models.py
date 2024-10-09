from django.db import models
from django.db.models import Q

from django.contrib.auth import get_user_model
from .validators import has_chinese, is_simplified, is_traditional, is_pinyin
from .segmenters import JiebaSegmenter

class ECDictionary(models.Model):
    traditional: str = models.TextField(validators=[is_traditional])
    simplified: str = models.TextField(validators=[is_simplified])
    pronunciation: str = models.TextField(validators=[is_pinyin])
    definitions: str = models.TextField()

    def save(self, **kwargs):
        self.definitions = '/'.join(self.definitions)
        super().save()

    def __str__(self):
        return f'{self.traditional} {self.simplified} {self.pronunciation} {[x for x in self.definitions.split('/')]}'

class Sentence(models.Model):
    user = models.ForeignKey(get_user_model(), on_delete=models.CASCADE)
    text = models.TextField(validators=[has_chinese])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    words = models.ManyToManyField(ECDictionary, through='WordsInSentence')

    def segmented(self):
        words_in_sentence = WordsInSentence.objects.filter(sentence=self).order_by('order')
        return [word.word.traditional if word.word else word.punctuation for word in words_in_sentence]

    def __str__(self):
        return self.text
    
    def save(self, *kwargs):
        #TODO: validate the text has chinese, include translation.
        super().save()
        segmented = JiebaSegmenter.segment(self.text)

        for index in range(len(segmented)):
            word = ECDictionary.objects.filter(Q(traditional=segmented[index]) | Q(simplified=segmented[index]))

            if len(word) == 0:
                WordsInSentence.objects.get_or_create(sentence=self, order=index, punctuation=segmented[index])[0].save()
                continue

            if len(word) >= 1:
                for i in range(len(word)):
                    WordsInSentence.objects.get_or_create(word=word[i], sentence=self, order=index)

class WordsInSentence(models.Model):
    sentence = models.ForeignKey(Sentence, on_delete=models.CASCADE)
    word = models.ForeignKey(ECDictionary, on_delete=models.CASCADE, null=True)
    punctuation = models.TextField(null=True)
    order = models.IntegerField()

    class Meta:
        ordering = ['order']