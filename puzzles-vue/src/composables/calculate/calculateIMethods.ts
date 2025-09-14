import type { indexRowCol } from '@/types'

// 指定されたせるの周囲の行・列インデックス範囲を習得する
// @param nowIndex 現在のセルの行・列インデックス
// @param maxIndex 行・列の最大インデックス(通常は board サイズ - 1)
// @param calNum 現在のセルからどれだけ周囲を含めるかの数字
// @returns 行・列ごとの最小・最大インデックスの範囲
export function getRowColRange(nowIndex: indexRowCol, maxIndex: number, calNum: number) {
  let minRow = nowIndex.rowIndex - calNum
  if (minRow < 0) minRow = 0

  let maxRow = nowIndex.rowIndex + calNum
  if (maxRow > maxIndex) maxRow = maxIndex

  let minCol = nowIndex.colIndex - calNum
  if (minCol < 0) minCol = 0

  let maxCol = nowIndex.colIndex + calNum
  if (maxCol > maxIndex) maxCol = maxIndex

  return {
    row: { minRow, maxRow },
    col: { minCol, maxCol },
  }
}

// 0 ~ N - 1 の数字からランダムの数字を n 個返す
// 注意：n >= Nの場合は全ての数字を返す
export function pickRandomNumbers(n: number, N: number): number[] {
  const nums = Array.from({ length: N }, (_, i) => i)
  const shuffled = nums.sort(() => Math.random() - 0.5)
  return shuffled.slice(0, n)
}

export function divideWithRemainder(N: number, n: number): { quotient: number; remainder: number } {
  const quotient = Math.floor(N / n)
  const remainder = N % n
  return { quotient, remainder }
}
