import { MandoBotAPI } from '@/utils/api';
import {
  appendToMandarinDictionary,
  appendToMandarinSentence,
  clearMandarinDictionary,
  clearMandarinSentence,
} from '@/utils/store/mandarinSentenceSlice';
import {
  ChineseDictionary,
  MandarinSentenceType,
  MandarinWordType,
  SegmentResponseType,
} from '@/utils/types';

import { RootState, store } from '@/utils/store/store';

/**
 * Data and methods for processing, storing, and displaying
 * Mandarin sentences.
 */
export class MandarinSentence {
  mandarin: string;
  segments: MandarinWordType[];
  dictionary: ChineseDictionary;
  translation: string;
  shareURL: string;
  batched: boolean;

  /**
   * Create a new MandarinSentence instance.
   * @param userInput Raw Mandarin sentence to process.
   */
  constructor(userInput: string, batched: boolean = false) {
    this.mandarin = userInput.trim();
    this.segments = [];
    this.dictionary = {};
    this.translation = '';
    this.shareURL = '';
    this.batched = batched;
  }

  private isReady() {
    return (
      this.translation !== '' &&
      this.shareURL !== '' &&
      this.segments.length !== 0 &&
      Object.keys(this.dictionary).length !== 0
    );
  }

  populate() {
    const rawHistory = localStorage.getItem('history');

    if (rawHistory) {
      const sentenceHistory: MandarinSentenceType[] = JSON.parse(rawHistory);
      const local = sentenceHistory.filter(
        (stored) => stored.mandarin === this.mandarin,
      );
      if (local && !this.isReady()) {
        this.segments = local[0].segments;
        this.dictionary = local[0].dictionary;
        this.translation = local[0].translation;
        this.shareURL = local[0].shareURL;
      } else if (!local && this.isReady()) {
        localStorage.setItem(
          'history',
          JSON.stringify({
            mandarin: this.mandarin,
            segments: this.segments,
            dictionary: this.dictionary,
            translation: this.translation,
            shareURL: this.shareURL,
          }),
        );
      } else {
        this.segment();
      }
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
      });
    }
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
  }
}
