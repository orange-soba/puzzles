<template>
  <h1>五目並べ</h1>
  <template v-if="!isSettled">
    <div class="turnArea">
      <p class="turn">{{ currentTurn ? '先行：⚫️' : '後攻：⚪️' }}</p>
      の番です
    </div>
  </template>
  <template v-else>
    <div class="resultArea">
      <p class="result">{{ finalResult.winner || '引き分け' }}</p>
      <p v-if="finalResult.winner" :style="sparkleStyle">の勝利です！</p>
      <p v-else>です！</p>
      <p v-if="finalResult.isFoul">{{ finalResult.loser }}の反則負けです😢</p>
      <br />
      <br />
      <button @click="onRestart">再戦</button>
    </div>
  </template>
  <div class="board">
    <div v-for="(row, rowIndex) in board" :key="rowIndex" class="row">
      <div
        v-for="(cell, colIndex) in row"
        :key="colIndex"
        class="cell"
        @click="onClick(rowIndex, colIndex)"
      >
        {{ cell }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useBoard } from '@/composables/board/useBoard'
import { useSparkle } from '@/composables/animation/useSparkle'
import { sleep } from '@/composables/helpers/sleep'

const { sparkleStyle } = useSparkle()

const boardSize = 15
const { board, resetBoard } = useBoard(boardSize)

const isSettled = ref(false)
const finalResult = {
  winner: '',
  loser: '',
  isFoul: false,
}
const turnNum = ref(0)

// true: 先手（⚫️: 黒）
// false: 後手（⚪️: 白）
const currentTurn = ref(true)
const currentStone = computed(() => (currentTurn.value ? '⚫️' : '⚪️'))

const onClick = async (row: number, col: number) => {
  // すでに石が置かれていたら何もしない
  if (!currentTurn.value || board.value[row][col] !== '' || isSettled.value) return

  // 石を置く
  await placeStone(row, col)

  // コンピュータのターン
  await nextTick()
  computerTurn()
}

const placeStone = async (row: number, col: number) => {
  // 石を置く
  board.value[row][col] = currentStone.value
  turnNum.value++

  // 結果の判定
  const result = checkResult(row, col)
  if (result > 0) {
    finalResult.isFoul = true
    finalResult.loser = currentStone.value
    currentTurn.value = !currentTurn.value
    finalResult.winner = currentStone.value

    isSettled.value = true
  }
  if (result === 0) {
    // 勝利時は少し時間を空けてから表示
    await nextTick()
    await sleep(500)
    finalResult.winner = currentStone.value
    currentTurn.value = !currentTurn.value
    finalResult.loser = currentStone.value

    isSettled.value = true
  }

  // 打つ場所がなくなったら引き分け
  if (turnNum.value === boardSize * boardSize) {
    isSettled.value = true
  }

  // 番手の交代
  currentTurn.value = !currentTurn.value
}

const computerTurn = () => {
  if (isSettled.value || currentTurn.value) return

  setTimeout(async () => {
    const emptyCells: [number, number][] = []
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        if (board.value[i][j] === '') {
          emptyCells.push([i, j])
        }
      }
    }

    if (emptyCells.length === 0) return

    const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)]
    await placeStone(r, c)

    if (!isSettled.value && !currentTurn.value) {
      computerTurn()
    }
  }, 500)
}

// 結果を判定
const checkResult = (row: number, col: number): number => {
  const stone = board.value[row][col]

  const directions = [
    { dr: 0, dc: 1 },
    { dr: 1, dc: 0 },
    { dr: 1, dc: 1 },
    { dr: 1, dc: -1 },
  ]

  // 0: 勝利
  // -: 勝負続行
  // +: 反則負け(6つ以上並んだら反則負け)
  let result = -1

  for (const { dr, dc } of directions) {
    let count = 1

    let r = row + dr
    let c = col + dc
    // ＋方向
    while (isValid(r, c) && board.value[r][c] === stone) {
      count++
      r += dr
      c += dc
    }

    // -方向
    r = row - dr
    c = col - dc
    while (isValid(r, c) && board.value[r][c] === stone) {
      count++
      r -= dr
      c -= dc
    }

    // +(6つ以上並ぶ): 反則負けなので即 1 を返す
    if (count >= 6) return 1
    else if (count === 5) result = 0
  }

  return result
}

// 盤面の範囲内かチェック
const isValid = (row: number, col: number): boolean => {
  return row >= 0 && row < boardSize && col >= 0 && col < boardSize
}

// 再戦
const onRestart = () => {
  isSettled.value = false
  currentTurn.value = true
  resetBoard()
}
</script>

<style scoped>
.turnArea,
.resultArea {
  text-align: center;
}
.turn,
.result {
  font-size: 32px;
  font-weight: bold;
}

.board {
  display: grid;
  grid-template-columns: repeat(15, 40px);
  grid-template-rows: repeat(15, 40px);
  background-color: #c9a063; /* 盤面の色 */
  padding: 10px;
  border: 4px solid #8b5a2b;
  width: fit-content;
  margin: 20px auto;
}

.cell {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f1d18a;
  border: 1px solid #8b5a2b;
  font-size: 24px;
  font-weight: bold;
  cursor: pointer;
}

.cell:hover {
  background-color: #e4c076;
}
</style>
