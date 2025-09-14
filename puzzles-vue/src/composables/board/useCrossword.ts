import { type Ref } from 'vue'
import { type CellCrossWord, type CrossWordAnswers, type NewEntry, type HintNums } from '@/types'

export const createCrosswordFromEntries = ({
  newEntries,
  board,
  rows,
  cols,
  crossWordAnswers,
  hintNums,
  showCreateModal,
  toKatakanaOnly,
}: {
  newEntries: NewEntry[]
  board: Ref<CellCrossWord[][]>
  rows: number
  cols: number
  crossWordAnswers: CrossWordAnswers
  hintNums: HintNums
  showCreateModal: Ref<boolean>
  toKatakanaOnly: (str: string) => string
}) => {
  // 入力ワードをカタカナ化・フィルタ
  const entries = newEntries
    .map((e) => ({ answer: toKatakanaOnly(e.answer), hint: e.hint }))
    .filter((e) => e.answer.length > 0)
  if (entries.length === 0) return

  // 文字数順にソート（長い単語から配置）
  entries.sort((a, b) => b.answer.length - a.answer.length)

  // 盤面初期化
  board.value = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ letter: '', isBlack: false, number: null })),
  )
  crossWordAnswers.vertical = {}
  crossWordAnswers.horizontal = {}
  hintNums.vertical = []
  hintNums.horizontal = []

  const occupiedGrid = Array.from({ length: rows }, () => Array(cols).fill(false))

  // 基準単語を中央に配置
  const baseWord = entries[0]
  const baseRow = Math.floor(rows / 2)
  const baseCol = Math.floor((cols - baseWord.answer.length) / 2)
  for (let i = 0; i < baseWord.answer.length; i++) {
    board.value[baseRow][baseCol + i].letter = baseWord.answer[i]
    occupiedGrid[baseRow][baseCol + i] = true
  }

  const placedWords: {
    word: string
    hint: string
    orientation: 'horizontal' | 'vertical'
    row: number
    col: number
  }[] = [
    {
      word: baseWord.answer,
      hint: baseWord.hint,
      orientation: 'horizontal',
      row: baseRow,
      col: baseCol,
    },
  ]

  // 残り単語を配置
  for (let i = 1; i < entries.length; i++) {
    const word = entries[i].answer
    const hint = entries[i].hint
    let placed = false

    outer: for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = board.value[r][c]
        for (let wi = 0; wi < word.length; wi++) {
          if (cell.letter === word[wi]) {
            // 横配置
            const startCol = c - wi
            if (startCol >= 0 && startCol + word.length <= cols) {
              let canPlace = true
              for (let k = 0; k < word.length; k++) {
                const checkCell = board.value[r][startCol + k]
                if (checkCell.letter && checkCell.letter !== word[k]) canPlace = false
              }
              if (canPlace) {
                for (let k = 0; k < word.length; k++) {
                  board.value[r][startCol + k].letter = word[k]
                  occupiedGrid[r][startCol + k] = true
                }
                placedWords.push({ word, hint, orientation: 'horizontal', row: r, col: startCol })
                placed = true
                break outer
              }
            }

            // 縦配置
            const startRow = r - wi
            if (startRow >= 0 && startRow + word.length <= rows) {
              let canPlace = true
              for (let k = 0; k < word.length; k++) {
                const checkCell = board.value[startRow + k][c]
                if (checkCell.letter && checkCell.letter !== word[k]) canPlace = false
              }
              if (canPlace) {
                for (let k = 0; k < word.length; k++) {
                  board.value[startRow + k][c].letter = word[k]
                  occupiedGrid[startRow + k][c] = true
                }
                placedWords.push({ word, hint, orientation: 'vertical', row: startRow, col: c })
                placed = true
                break outer
              }
            }
          }
        }
      }
    }

    // 置けなければ横配置
    if (!placed) {
      outer2: for (let r = 0; r < rows; r++) {
        for (let c = 0; c <= cols - word.length; c++) {
          let canPlace = true
          for (let k = 0; k < word.length; k++) if (occupiedGrid[r][c + k]) canPlace = false
          if (canPlace) {
            for (let k = 0; k < word.length; k++) {
              board.value[r][c + k].letter = word[k]
              occupiedGrid[r][c + k] = true
            }
            placedWords.push({ word, hint, orientation: 'horizontal', row: r, col: c })
            break outer2
          }
        }
      }
    }
  }

  // 空マスを黒マス
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) if (!board.value[r][c].letter) board.value[r][c].isBlack = true

  // 盤面番号振り
  let num = 1
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = board.value[r][c]
      if (cell.isBlack || cell.number) continue
      let isStart = false
      if (
        (c === 0 || board.value[r][c - 1].isBlack) &&
        c + 1 < cols &&
        !board.value[r][c + 1].isBlack
      )
        isStart = true
      if (
        (r === 0 || board.value[r - 1][c].isBlack) &&
        r + 1 < rows &&
        !board.value[r + 1][c].isBlack
      )
        isStart = true
      if (isStart) cell.number = num++
    }
  }

  // ヒント番号を盤面番号に紐付け
  crossWordAnswers.horizontal = {}
  crossWordAnswers.vertical = {}
  hintNums.horizontal = []
  hintNums.vertical = []

  placedWords.forEach((p) => {
    if (!p.hint || p.hint.trim() === '') return
    const cell = board.value[p.row][p.col]
    if (!cell.number) return
    const n = cell.number
    if (p.orientation === 'horizontal') {
      crossWordAnswers.horizontal[n] = { answer: p.word, hint: p.hint }
      hintNums.horizontal.push(n)
    } else {
      crossWordAnswers.vertical[n] = { answer: p.word, hint: p.hint }
      hintNums.vertical.push(n)
    }
  })
  // console.log(hintNums)

  hintNums.horizontal.sort((a, b) => a - b)
  hintNums.vertical.sort((a, b) => a - b)
  // console.log(hintNums.horizontal)

  showCreateModal.value = false

  // デバッグ出力
  // const printBoard = () => {
  //   console.log('--- Board ---')
  //   board.value.forEach((row) => console.log(row.map((cell) => cell.letter || '■').join(' ')))
  //   console.log('--- Numbers ---')
  //   board.value.forEach((row) =>
  //     console.log(
  //       row.map((cell) => (cell.number ? String(cell.number).padStart(2, '0') : '  ')).join(' '),
  //     ),
  //   )
  //   console.log('--- HintNums ---')
  //   console.log('Horizontal:', hintNums.horizontal)
  //   console.log('Vertical:', hintNums.vertical)
  //   console.log('-------------')
  // }
  // printBoard()
}
