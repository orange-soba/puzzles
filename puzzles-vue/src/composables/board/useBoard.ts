import { ref } from 'vue'

import type { Cell, CellCrossWord } from '@/types'

// n * n の盤面とそれをリセットするメソッドを提供
export function useBoard(size: number) {
  const board = ref(Array.from({ length: size }, () => Array(size).fill('')))

  const resetBoard = () => {
    board.value = Array.from({ length: size }, () => Array(size).fill(''))
  }

  return { board, resetBoard }
}

// // ナンプレのボードを提供（仮）
// export const useNumberPlaceBoard = () => {
//   const board = ref<Cell[][]>([])
//   const numberPlaceSize = 9

//   const resetBoard = () => {
//     const initial: Cell[][] = Array.from({ length: numberPlaceSize }, (_, row) =>
//       Array.from({ length: numberPlaceSize }, (_, col) => {
//         const initialValue = getInitialValue(row, col) // 初期盤面の値
//         const fixed = initialValue !== ''
//         return {
//           value: initialValue,
//           fixed: fixed, // 初期値があれば true とする
//           answer: fixed, // 初期値がある場所は正解ということにする
//           memo: [], // memo は最初は空欄
//         }
//       }),
//     )
//     board.value = initial
//   }

//   resetBoard()
//   return { board, resetBoard }
// }

// // ナンプレの初期値を設定
// export const getInitialValue = (row: number, col: number) => {
//   const initialBoard = [
//     ['', '', '1', '', '2', '4', '', '', ''],
//     ['', '', '', '5', '7', '', '', '6', ''],
//     ['', '6', '', '', '', '', '', '2', ''],
//     ['', '2', '5', '', '', '', '3', '9', ''],
//     ['7', '', '', '', '', '6', '', '', ''],
//     ['', '', '', '4', '', '', '5', '', '2'],
//     ['2', '', '', '', '', '', '', '', '4'],
//     ['', '', '', '', '', '', '6', '', ''],
//     ['', '', '6', '', '8', '3', '', '', '5'],
//   ]

//   return initialBoard[row][col]
// }

// // ナンプレの解答を提供
// export const getAnswerValue = (row: number, col: number) => {
//   const answerBoard = [
//     ['3', '7', '1', '6', '2', '4', '8', '5', '9'],
//     ['8', '9', '2', '5', '7', '1', '4', '6', '3'],
//     ['5', '6', '4', '3', '9', '8', '7', '2', '1'],
//     ['4', '2', '5', '8', '1', '7', '3', '9', '6'],
//     ['7', '3', '9', '2', '5', '6', '1', '4', '8'],
//     ['6', '1', '8', '4', '3', '9', '5', '7', '2'],
//     ['2', '8', '7', '1', '6', '5', '9', '3', '4'],
//     ['1', '5', '3', '9', '4', '2', '6', '8', '7'],
//     ['9', '4', '6', '7', '8', '3', '2', '1', '5'],
//   ]

//   return answerBoard[row][col]
// }

// ナンプレのボードを提供
export const useNumberPlaceBoard = (emptyCells = 40) => {
  const board = ref<Cell[][]>([])
  const numberPlaceSize = 9

  // 完成盤面のキャッシュ
  let answerCache: string[][] = []

  // 盤面をリセット
  const resetBoard = () => {
    const answerBoard = generateFullBoard() // 感染盤面を生成
    const initialBoard = removeCells(answerBoard, emptyCells) // 指定数だけ空欄にする

    const initial: Cell[][] = Array.from({ length: numberPlaceSize }, (_, row) =>
      Array.from({ length: numberPlaceSize }, (_, col) => {
        const val = initialBoard[row][col]
        const fixed = val !== ''
        return {
          value: val,
          fixed: fixed,
          answer: fixed, // 最初は固定マスだけ正解とする
          memo: [],
        }
      }),
    )
    board.value = initial
    answerCache = answerBoard
  }

  // 指定セルの正解を返す
  const getAnswerValue = (row: number, col: number) => {
    return answerCache[row][col]
  }

  resetBoard()

  return { board, resetBoard, getAnswerValue }
}

// --------------------
// 完成盤面生成（バックトラッキング）
// --------------------
function generateFullBoard(): string[][] {
  const size = 9
  const board: string[][] = Array.from({ length: size }, () => Array(size).fill(''))

  // 偏りのないFisher–Yatesシャッフルを使用
  const shuffleArray = <T>(array: T[]): T[] => {
    const arr = [...array]
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }

  const isSafe = (board: string[][], row: number, col: number, num: number) => {
    const s = num.toString()
    for (let i = 0; i < size; i++) {
      if (board[row][i] === s) return false
      if (board[i][col] === s) return false
    }
    const startRow = Math.floor(row / 3) * 3
    const startCol = Math.floor(col / 3) * 3
    for (let r = startRow; r < startRow + 3; r++) {
      for (let c = startCol; c < startCol + 3; c++) {
        if (board[r][c] === s) return false
      }
    }

    return true
  }

  const fillBoard = (board: string[][], row = 0, col = 0): boolean => {
    if (row === size) return true
    const nextRow = col === size - 1 ? row + 1 : row
    const nextCol = col === size - 1 ? 0 : col + 1
    const numbers = shuffleArray([1, 2, 3, 4, 5, 6, 7, 8, 9])
    for (const n of numbers) {
      if (isSafe(board, row, col, n)) {
        board[row][col] = n.toString()
        if (fillBoard(board, nextRow, nextCol)) return true
        board[row][col] = ''
      }
    }

    return false
  }

  fillBoard(board)

  return board
}

// --------------------
// 指定数だけマスを空欄にする
// --------------------
function removeCells(board: string[][], emptyCount: number) {
  const size = 9
  const newBoard = board.map((row) => [...row])
  let removed = 0
  while (removed < emptyCount) {
    const r = Math.floor(Math.random() * size)
    const c = Math.floor(Math.random() * size)
    if (newBoard[r][c] !== '') {
      newBoard[r][c] = ''
      removed++
    }
  }

  return newBoard
}

// 2次元配列をディープコピーする
// export function cloneBoard<T>(array: T[][]): T[][] {
//   return array.map((row) => [...row])
// }
export function cloneBoard<T extends object>(array: T[][]): T[][] {
  return array.map((row) => row.map((cell) => ({ ...cell })))
}

// 2次元配列を transpose する
export function transposeBoard<T>(array: T[][]): T[][] {
  return array[0].map((_, index) => array.map((row) => row[index]))
}

// クロスワードの盤面を用意する。
export function createCrossWordBoard(rows: number, cols: number): CellCrossWord[][] {
  // 盤面の初期化
  const board = []
  for (let r = 0; r < rows; r++) {
    const row = []
    for (let c = 0; c < cols; c++) {
      row.push({
        isBlack: false,
        letter: '',
        number: null,
      })
    }
    board.push(row)
  }

  // 固定の黒マス配置
  const fixedBlackCells = [
    [0, 2],
    [1, 4],
    [2, 0],
    [2, 6],
    [3, 3],
    [4, 1],
    [4, 5],
    [6, 2],
  ]

  for (const [r, c] of fixedBlackCells) {
    if (r < rows && c < cols) {
      board[r][c].isBlack = true
    }
  }

  return board

  // ランダムに黒マスを埋める
  // まずは一定の形にするため未実装
  // blackCellsCount = Math.floor(rows * cols * 0.2)
}

// 全て false で埋めた 2次元配列を用意
export function createFalseGrid(rows: number, cols: number): boolean[][] {
  return Array.from({ length: rows }, () => Array.from({ length: cols }, () => false))
}
