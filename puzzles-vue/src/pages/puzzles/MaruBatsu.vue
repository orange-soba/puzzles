<template>
  <main class="maruBatsuPuzzle">
    <template v-if="!isSettled">
      <div class="turnArea">
        <p class="turn">{{ turn ? '先行' : '後攻' }}</p>
        の番です
      </div>
      <div class="outline">
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
    <template v-else>
      <div class="resultArea">
        <p class="result">{{ result.winner || '引き分け' }}</p>
        <p v-if="result.winner">の勝利です！！</p>
        <p v-else>です！！</p>
        <br />
        <br />
        <button @click="onRestart">再戦</button>
      </div>
    </template>
  </main>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { sleep } from '@/composables/helpers/sleep'

const isSettled = ref(false)
const turn = ref(true) // true: 先攻、false: 後攻
const turnNum = ref(0)
const result = ref({
  winner: '',
})

const boardSize = 3
const board = ref(Array.from({ length: boardSize }, () => Array(boardSize).fill('')))

const onRestart = () => {
  isSettled.value = false
  turn.value = true
  turnNum.value = 0
  board.value = Array.from({ length: boardSize }, () => Array(boardSize).fill(''))
}

const onClick = async (row: number, column: number) => {
  // 既に入力済みの場合はスルー
  if (!turn.value || board.value[row][column] !== '' || isSettled.value) return

  placeCheck(row, column)

  await nextTick()
  computerTurn()
}

const placeCheck = async (row: number, column: number) => {
  // ⭕️or❌を入力
  board.value[row][column] = turn.value ? '⭕️' : '❌'

  turnNum.value++

  // 勝ち負けのジャッジ
  if (checkWin(row, column)) {
    result.value.winner = turn.value ? '先行' : '後攻'
    await nextTick()
    await sleep(500)
    isSettled.value = true
    return
  }

  if (turnNum.value == 9) isSettled.value = true

  // 先行・後攻の入れ替え
  turn.value = !turn.value
}

const computerTurn = () => {
  if (turn.value || isSettled.value) return

  setTimeout(() => {
    const emptyCells: [number, number][] = []
    for (let i = 0; i < boardSize; i++) {
      for (let j = 0; j < boardSize; j++) {
        if (board.value[i][j] === '') {
          emptyCells.push([i, j])
        }
      }
    }

    const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)]
    placeCheck(r, c)

    if (!isSettled.value || !turn.value) {
      computerTurn()
    }
  }, 500)
}

const checkWin = (row: number, column: number) => {
  const symbol = board.value[row][column]

  // 横のチェック
  const rowCheck = board.value[row].every((cell) => cell === symbol)
  // 縦のチェック
  const columnCheck = board.value.every((row) => row[column] === symbol)
  // 斜めのチェック
  const diagonalCheck =
    [0, 1, 2].every((i) => board.value[i][i] === symbol) ||
    [0, 1, 2].every((i) => board.value[i][2 - i] === symbol)

  return rowCheck || columnCheck || diagonalCheck
}
</script>

<style scoped>
.maruBatsuPuzzle {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.turnArea,
.resultArea {
  text-align: center;
}
.turn,
.result {
  font-size: 32px;
  font-weight: bold;
}
.outline {
  display: grid;
  grid-template-rows: repeat(3, 120px);
  grid-template-columns: repeat(3, 120px);
  gap: 0;
  margin: 20px;
  border: 3px solid black;
  width: 363px;
  height: 363px;
  /* padding: 0 1.5px 1.5px 0; */
}
.cell {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  border: 1px solid black;
  cursor: pointer;
  width: 100%;
  height: 100%;
}
</style>
