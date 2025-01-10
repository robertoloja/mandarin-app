import { updateLoading } from '@/utils/store/loadingSlice';
import { store } from '@/utils/store/store';
import {
  appendToMandarinDictionary,
  appendToMandarinSentence,
  clearMandarinDictionary,
  clearMandarinSentence,
  setShareLink,
} from '@/utils/store/mandarinSentenceSlice';
import { MandoBotAPI } from '@/utils/api';
import {
  MandarinSentenceType,
  SegmentResponseType,
  ChineseDictionary,
  MandarinWordType,
} from '@/utils/types';

export class MandarinSentenceClass {
  mandarin: string;
  segments: MandarinWordType[];
  dictionary: ChineseDictionary;
  translation: string;
  shareURL: string;
  batched: boolean;

  constructor(userInput: string, batched: boolean = false) {
    this.mandarin = userInput.trim();
    this.segments = [];
    this.dictionary = {};
    this.translation = '';
    this.shareURL = '';
    this.batched = batched;
  }

  populate() {
    this.updateLoading(0);
    const rawHistory = localStorage.getItem('history');

    if (rawHistory) {
      const sentenceHistory: MandarinSentenceType[] = JSON.parse(rawHistory);
      const local = sentenceHistory.filter(
        (stored) => stored.mandarin === this.mandarin,
      );
      if (local.length !== 0 && !this.isReady()) {
        this.segments = local[0].segments;
        this.dictionary = local[0].dictionary;
        this.translation = local[0].translation;
        this.shareURL = local[0].shareURL;
        this.finish();
        return;
      } else if (local.length === 0 && this.isReady()) {
        this.finish();
        return;
      }
    } else {
      this.segment().then(() => {
        this.finish();
      });
    }
  }

  private async segment() {
    if (this.batched) {
      const batches = this.mandarin.split(/(?<=[。？！.?!])/);

      let orderedBatches = {} as {
        [index: number]: {
          sentence: MandarinWordType[];
          dictionary: ChineseDictionary;
          translation: string;
        };
      };
      const promises = batches.map((batch, i) =>
        MandoBotAPI.segment(batch).then((response) => {
          orderedBatches[i] = response;
          this.updateLoading(
            Math.floor(Object.keys(orderedBatches).length / batches.length),
          );
        }),
      );
      Promise.all(promises)
        .then(() => {
          for (let i = 0; i < batches.length; i++) {
            this.segments = [...this.segments, ...orderedBatches[i].sentence];
            this.translation += orderedBatches[i].translation;
            this.dictionary = {
              ...this.dictionary,
              ...orderedBatches[i].dictionary,
            };
          }
        })
        .finally(() => {
          MandoBotAPI.share({
            sentence: this.segments,
            dictionary: this.dictionary,
            translation: this.translation,
          }).then((response) => {
            this.shareURL = response;
            this.finish();
          });
        });
    } else {
      await MandoBotAPI.segment(this.mandarin).then(
        (response: SegmentResponseType) => {
          this.segments = response.sentence;
          this.dictionary = response.dictionary;
          this.translation = response.translation;
        },
      );
      await MandoBotAPI.share({
        translation: this.translation,
        sentence: this.segments,
        dictionary: this.dictionary,
      }).then((response: string) => {
        this.shareURL = response;
        this.finish();
      });
    }
  }

  private addToLocalStorage() {
    const rawHistory = localStorage.getItem('history');
    let local: MandarinSentenceType[] = [];

    if (rawHistory) local = JSON.parse(rawHistory);
    if (local.filter((x) => x.mandarin === this.mandarin).length !== 0) return;
    const newHistory = [
      ...local,
      {
        mandarin: this.mandarin,
        segments: this.segments,
        dictionary: this.dictionary,
        translation: this.translation,
        shareURL: this.shareURL,
      },
    ];
    localStorage.setItem('history', JSON.stringify(newHistory));
  }

  setActive() {
    store.dispatch(clearMandarinSentence());
    store.dispatch(
      appendToMandarinSentence({
        translation: this.translation,
        segments: this.segments,
      }),
    );
    store.dispatch(clearMandarinDictionary());
    store.dispatch(appendToMandarinDictionary(this.dictionary));
    store.dispatch(setShareLink(this.shareURL));
  }

  private isReady() {
    return (
      this.translation !== '' &&
      this.shareURL !== '' &&
      this.segments.length !== 0 &&
      Object.keys(this.dictionary).length !== 0
    );
  }

  private finish() {
    this.updateLoading(100);
    this.setActive();
    this.addToLocalStorage();
  }

  private updateLoading(p: number) {
    store.dispatch(updateLoading({ percent: p }));
  }
}
