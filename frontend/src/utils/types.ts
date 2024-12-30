export type ChineseDictionary = Record<string, {
  english: string,
  pinyin: string, 
  simplified: string
}>
  
export type MandarinWordType = {
  word: string,
  pinyin: string[],
  definitions: string[],
  dictionary: ChineseDictionary,
}
  
export type MandarinSentenceType = {
  translation: string,
  sentence: MandarinWordType[],
}