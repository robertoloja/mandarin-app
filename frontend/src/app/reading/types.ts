export interface Subchapter {
  name: string;
  book_slug: string;
  chapter_order: number;
}

export interface Chapter {
  number: string;
  title: string;
  subchapters?: Subchapter[];
  chapter_order?: number;
  book_slug?: string;
}

export interface ReadingProps {
  mandarinTitle: string;
  titleLink: string;
  title: string;
  chapters: Chapter[][];
  background: string;
  attribution: {
    image: string;
    text: string;
  };
}
