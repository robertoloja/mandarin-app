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
  translations: Record<string, string>;
  shareURL: string;
  batched: boolean;

  constructor(
    userInput: string,
    segments: MandarinWordType[] = [],
    dictionary: ChineseDictionary = {},
    translations: Record<string, string> = {},
    shareURL: string = '',
    batched: boolean = process.env.NODE_ENV === 'development' ? false : true,
  ) {
    this.mandarin = userInput
      ? userInput.trim()
      : segments
          .map((x) => x.word)
          .join('')
          .trim();
    this.segments = segments;
    this.dictionary = dictionary;
    this.translations = translations;
    this.shareURL = shareURL;
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
        // Handle both old format (translation: string) and new format (translations: Record<string, string>)
        const stored = local[0] as MandarinSentenceType & {
          translation?: string;
        };
        this.translations =
          stored.translations ??
          (stored.translation ? { en: stored.translation } : {});
        this.shareURL = local[0].shareURL;
        this.finish();
        return;
      } else if (local.length === 0 && this.isReady()) {
        this.finish();
        return;
      }
    }
    this.segment();
  }

  private async segment() {
    if (this.batched) {
      const batches = this.mandarin.split(/(?<=[。？！.?!])/);

      const orderedBatches = {} as {
        [index: number]: SegmentResponseType;
      };
      // Execute concurrently...
      const promises = batches.map((batch, i) =>
        MandoBotAPI.segment(batch).then((response) => {
          orderedBatches[i] = response;
        }),
      );
      // ...retrieve synchronously.
      (async () => {
        for (let i = 0; i < promises.length; i++) {
          await promises[i];
          this.appendToStore(orderedBatches[i]);
          this.segments = [...this.segments, ...orderedBatches[i].sentence];
          for (const [lang, text] of Object.entries(
            orderedBatches[i].translations,
          )) {
            this.translations[lang] =
              (this.translations[lang] ? this.translations[lang] + ' ' : '') +
              text;
          }
          this.dictionary = {
            ...this.dictionary,
            ...orderedBatches[i].dictionary,
          };
          await this.sleep(10);
          this.updateLoading(Math.floor((i + 1 / promises.length) * 100));
        }
      })();
      Promise.all(promises).then(() => {
        MandoBotAPI.share({
          sentence: this.segments,
          dictionary: this.dictionary,
          translations: this.translations,
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
          this.translations = response.translations;

          if (process.env.NODE_ENV === 'development') {
            for (const hanzi of this.mandarin) {
              if (!Object.keys(this.dictionary).includes(hanzi)) {
                console.log(hanzi);
              }
            }
          }
        },
      );
      await MandoBotAPI.share({
        translations: this.translations,
        sentence: this.segments,
        dictionary: this.dictionary,
      }).then((response: string) => {
        this.shareURL = response;
        this.finish();
      });
    }
  }

  /**
   * For debouncing redux store updates.
   * @param ms Sleep interval
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private addToHistory() {
    // TODO: Also add via the API
    const rawHistory = localStorage.getItem('history');
    let local: MandarinSentenceType[] = [];

    if (rawHistory) local = JSON.parse(rawHistory);
    if (
      local.filter(
        (x) => x.mandarin === this.mandarin || x.shareURL === this.shareURL,
      ).length !== 0
    )
      return;
    const newHistory = [
      ...local,
      {
        mandarin: this.mandarin,
        segments: this.segments,
        dictionary: this.dictionary,
        translations: this.translations,
        shareURL: this.shareURL,
        date: new Date(),
      },
    ];
    localStorage.setItem('history', JSON.stringify(newHistory));
  }

  deleteFromHistory() {
    // TODO: Also delete from the API
    const rawHistory = localStorage.getItem('history');
    let local: MandarinSentenceType[] = [];

    if (rawHistory) local = JSON.parse(rawHistory);
    for (let i = 0; i < local.length; i++) {
      if (
        this.mandarin === local[i].mandarin ||
        this.shareURL === local[i].shareURL
      ) {
        local.splice(i, 1);
        localStorage.setItem('history', JSON.stringify(local));
      }
    }
    this.emptyFields();
  }

  private appendToStore(partiallySegmented: SegmentResponseType) {
    store.dispatch(
      appendToMandarinSentence({
        mandarin: this.mandarin,
        translations: partiallySegmented.translations,
        segments: partiallySegmented.sentence,
      }),
    );
    store.dispatch(appendToMandarinDictionary(partiallySegmented.dictionary));
  }

  setActive() {
    this.addToHistory();
    store.dispatch(clearMandarinSentence());
    store.dispatch(clearMandarinDictionary());
    store.dispatch(setShareLink(this.shareURL));
    store.dispatch(
      appendToMandarinSentence({
        mandarin: this.mandarin,
        translations: this.translations,
        segments: this.segments,
      }),
    );
    store.dispatch(appendToMandarinDictionary(this.dictionary));
  }

  private isReady() {
    return (
      Object.keys(this.translations).length > 0 &&
      this.shareURL !== '' &&
      this.segments.length !== 0 &&
      Object.keys(this.dictionary).length !== 0
    );
  }

  private finish() {
    this.updateLoading(100);
    this.setActive();
  }

  private updateLoading(p: number) {
    store.dispatch(updateLoading({ percent: p }));
  }

  private emptyFields() {
    this.mandarin = '';
    this.segments = [];
    this.dictionary = {};
    this.translations = {};
    this.shareURL = '';
    store.dispatch(clearMandarinDictionary());
    store.dispatch(clearMandarinSentence());
    store.dispatch(setShareLink(''));
  }
}
