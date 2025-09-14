<template>
  <div class="title">
    <h1>2048</h1>
  </div>
  <div class="scoreArea">
    <div class="nowScore">現在のスコア：{{ nowScore }}</div>
    <div class="bestScore">
      ベストスコア：{{ bestScore }}
      <span>
        <button @click="deleteBestScore">削除</button>
      </span>
    </div>
  </div>
  <div class="buttonArea">
    <button @click="onRestart">リスタート</button>
  </div>
  <div class="board">
    <div v-for="(row, rowIndex) in board" :key="rowIndex" class="boardRow">
      <div
        v-for="(cell, cellIndex) in row"
        :key="cellIndex"
        :data-value="cell"
        class="boardCell"
        :class="{ empty: !cell }"
      >
        {{ cell }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useBoard, cloneBoard, transposeBoard } from '@/composables/board/useBoard'
import { pickRandomNumbers, divideWithRemainder } from '@/composables/calculate/calculateIMethods'

const boardSize = 4
const { board, resetBoard } = useBoard(boardSize)

// 16個のマスのうち2箇所をランダムに選び2を設置する
const startGame = () => {
  const randomNums = pickRandomNumbers(2, 16)
  const { quotient: row1, remainder: col1 } = divideWithRemainder(randomNums[0], 4)
  const { quotient: row2, remainder: col2 } = divideWithRemainder(randomNums[1], 4)
  board.value[row1][col1] = 2
  board.value[row2][col2] = 2
}

startGame()

// 2048 のテスト用
// board.value[0][0] = 1024
// board.value[0][1] = 1024

// すぐゲームオーバーになるデータ
// board.value = [
//   [2, 4, 8, 16],
//   [32, 64, 128, 256],
//   [512, 1024, 2, 2],
//   [8, 16, 32, 64],
// ]

const onRestart = () => {
  nowScore.value = 0
  isReached2048.value = false
  resetBoard()
  startGame()

  window.addEventListener('keydown', handleKeyDown)
}

const nowScore = ref(0)
const bestScore = ref(0)
const isReached2048 = ref(false)

const deleteBestScore = () => {
  const isDelete = confirm('ベストスコアを削除しても良いですか？')

  if (isDelete) {
    localStorage.removeItem('bestScore')

    bestScore.value = 0
  }
}

const handleKeyDown = (event: KeyboardEvent) => {
  // マスの移動が起きたかチェック用に盤面をコピーする
  const clonedBoard = cloneBoard(board.value)

  // マスの移動
  if (event.code === 'ArrowLeft') {
    slideLeft()
  } else if (event.code === 'ArrowRight') {
    slideRight()
  } else if (event.code === 'ArrowDown') {
    slideDown()
  } else if (event.code === 'ArrowUp') {
    slideUp()
  }

  // マスの移動が起きていない時は以降の処理はしない
  const slideOccurred = checkSlideOccurred(clonedBoard)

  if (slideOccurred) {
    setTwoFourRandomCell()

    if (isGameOver()) {
      // ベストスコアの更新
      setBestScore()

      // イベントリスナーを解除
      window.removeEventListener('keydown', handleKeyDown)

      alert('ゲームオーバーです！\nもう一度遊ぶにはリスタートを押してください')
    }
  }
}

// 方向キー(左)を押した時の動作
const slideLeft = () => {
  const clonedBoard = cloneBoard(board.value)

  for (let i = 0; i < clonedBoard.length; i++) {
    const row = clonedBoard[i]
    const newRow = slideAndMergeLeft(row)

    for (let j = 0; j < row.length; j++) {
      if (j < newRow.length) {
        board.value[i][j] = newRow[j]
      } else {
        board.value[i][j] = ''
      }
    }
  }
}
// 方向キー(右)を押した時の動作
const slideRight = () => {
  const clonedBoard = cloneBoard(board.value)

  for (let i = 0; i < clonedBoard.length; i++) {
    const row = clonedBoard[i].reverse()
    const newRow = slideAndMergeLeft(row)

    for (let j = 0; j < row.length; j++) {
      if (j < newRow.length) {
        board.value[i][row.length - j - 1] = newRow[j]
      } else {
        board.value[i][row.length - j - 1] = ''
      }
    }
  }
}
// 方向キー(下)を押した時の動作
const slideDown = () => {
  const clonedBoard = cloneBoard(board.value)
  const transposedBoard = transposeBoard(clonedBoard)

  for (let i = 0; i < transposedBoard.length; i++) {
    const row = transposedBoard[i].reverse()
    const newRow = slideAndMergeLeft(row)

    for (let j = 0; j < row.length; j++) {
      if (j < newRow.length) {
        board.value[row.length - j - 1][i] = newRow[j]
      } else {
        board.value[row.length - j - 1][i] = ''
      }
    }
  }
}
// 方向キー(上)を押した時の動作
const slideUp = () => {
  const clonedBoard = cloneBoard(board.value)
  const transposedBoard = transposeBoard(clonedBoard)

  for (let i = 0; i < transposedBoard.length; i++) {
    const row = transposedBoard[i]
    const newRow = slideAndMergeLeft(row)

    for (let j = 0; j < row.length; j++) {
      if (j < newRow.length) {
        board.value[j][i] = newRow[j]
      } else {
        board.value[j][i] = ''
      }
    }
  }
}

// 引数の row を左詰めにする
// 同じ数字はマージする
// 例：[2, '', 2, 2] => [4, 2]
const slideAndMergeLeft = (row: (number | '')[]): number[] => {
  const filtered = row.filter((n): n is number => n !== '')
  const result: number[] = []

  let skip = false
  for (let i = 0; i < filtered.length; i++) {
    if (skip) {
      skip = false
      continue
    }

    if (filtered[i] === filtered[i + 1]) {
      const merged = filtered[i] * 2
      result.push(merged)
      skip = true

      // 得点を加算
      nowScore.value += merged

      // ベストスコアの更新
      setBestScore()

      // 2048 に到達！！
      if (merged === 2048 && !isReached2048.value) {
        isReached2048.value = true
      }
    } else {
      result.push(filtered[i])
    }
  }

  return result
}

// マスの移動が起きたかチェックするメソッド
const checkSlideOccurred = (clonedBoard: (number | '')[][]) => {
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (clonedBoard[i][j] !== board.value[i][j]) {
        return true
      }
    }
  }
  return false
}

// 空のマスを探すメソッド
const searchNullCell = () => {
  const result = []
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      if (board.value[i][j] === '') {
        result.push([i, j])
      }
    }
  }
  return result
}

// 空のマスをから1つランダムに返すメソッド
const selectRandomCell = (): number[] => {
  const nullCells = searchNullCell()

  if (nullCells.length === 0) return []

  const randomCell = nullCells[Math.floor(Math.random() * nullCells.length)]

  return randomCell
}

// 2 か 4 を盤面にランダムに設定するメソッド
const setTwoFourRandomCell = () => {
  const cell = selectRandomCell()
  if (cell.length === 0) return

  const newValue = Math.random() < 0.9 ? 2 : 4

  const [row, col] = cell
  board.value[row][col] = newValue
}

// ベストスコアの更新をする
const setBestScore = () => {
  if (nowScore.value > bestScore.value) {
    bestScore.value = nowScore.value
    localStorage.setItem('bestScore', String(bestScore.value))
  }
}

// ゲームオーバー判定メソッド
const isGameOver = () => {
  return searchNullCell().length === 0 && !isCanMerge()
}

// まだマージ可能か判定
const isCanMerge = () => {
  for (let i = 0; i < boardSize; i++) {
    for (let j = 0; j < boardSize; j++) {
      const current = board.value[i][j]

      // 右隣と同じ(左右どちらのスライドでも同じ)
      if (j + 1 < boardSize && board.value[i][j + 1] === current) return true
      // 下隣とお同じ(上下どちらのスライドでも同じ)
      if (i + 1 < boardSize && board.value[i + 1][j] === current) return true
    }
  }
  return false
}

// イベントリスナーの設定
onMounted(() => {
  // ローカルストレージに保存してあるベストスコアを呼び出す
  const savedScore = localStorage.getItem('bestScore')
  if (savedScore) bestScore.value = Number(savedScore)

  window.addEventListener('keydown', handleKeyDown)
})
onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown)
})

watch(isReached2048, async (newVal) => {
  if (newVal) {
    // DOM の更新を待つ(2048 達成後の盤面を画面に表示させる)
    await nextTick()

    setTimeout(() => {
      const isContinue = confirm('2048に到達しました！🎉\nこのままゲームを続けますか？')

      if (!isContinue) {
        // ベストスコアの更新
        setBestScore()

        window.removeEventListener('keydown', handleKeyDown)
        alert('ゲームを終了します。お疲れ様でした！')
      }
    }, 0)
  }
})
</script>

<style scoped>
.board {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 10px;
  width: fit-content;
  margin: 20px auto;
}
.boardRow {
  display: flex;
  gap: 12px;
}
.boardCell {
  width: 100px;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 600;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  letter-spacing: 0.5px;
  border-radius: 4px;
}
.boardCell[data-value='2'] {
  background-color: #e3f2fd;
}
.boardCell[data-value='4'] {
  background-color: #fef0d1;
}
.boardCell[data-value='8'] {
  background-color: #b3e5a1;
}
.boardCell[data-value='16'] {
  background-color: #ffe57f;
}
.boardCell[data-value='32'] {
  background-color: #ffeb3b;
}
.boardCell[data-value='64'] {
  background-color: #ff5722;
}
.boardCell[data-value='128'] {
  background-color: #fbc02d;
}
.boardCell[data-value='256'] {
  background-color: #3f51b5;
  color: #fff;
}
.boardCell[data-value='512'] {
  background-color: #8d6e63;
  color: #fff;
}
.boardCell[data-value='1024'] {
  background-color: silver;
}
.boardCell[data-value='2048'] {
  background-color: gold;
}
.boardCell.empty {
  background-color: #f3e5e5;
}
</style>
