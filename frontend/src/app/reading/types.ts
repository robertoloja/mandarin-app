export interface Chapter {
  number: string;
  title: string;
  subchapters?: { name: string; link?: string }[];
  link?: string;
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
