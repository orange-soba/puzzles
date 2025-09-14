import { type Ref } from 'vue'

export interface indexRowCol {
  rowIndex: number
  colIndex: number
}

export interface Cell {
  value: string
  fixed: boolean
  answer: boolean
  memo: number[]
}

export interface CellCrossWord {
  letter: string
  isBlack: boolean
  number: number | null
  color?: string
}

export type HintInfo = {
  count: number
  position: { row: number; col: number }
}

export type Hints = {
  [key: number]: HintInfo
}

export type CrossWordEntry = {
  answer: string
  hint: string
}

export type CrossWordAnswers = {
  vertical: { [key: number]: CrossWordEntry }
  horizontal: { [key: number]: CrossWordEntry }
}

export type HintNums = {
  vertical: number[]
  horizontal: number[]
}

export type NewEntry = {
  answer: string
  hint: string
}

export type SubmitNewEntriesParams = {
  newEntries: NewEntry[]
  board: Ref<CellCrossWord[][]>
  rows: number
  cols: number
  crossWordAnswers: CrossWordAnswers
  hintNums: HintNums
  assignNumberToBoard: (rows: number, cols: number) => void
  showCreateModal: Ref<boolean>
  toKatakanaOnly: (str: string) => string
}
