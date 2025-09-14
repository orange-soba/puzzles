<template>
  <h1>ナンプレ</h1>

  <div class="generateArea">
    <span>難易度を自由に調整できます</span>
    <input type="number" min="1" max="72" ref="emptyCountRef" placeholder="空欄数" />
    <button @click="onGenerate">決定</button>
  </div>

  <!-- 結果表示 or ボタン表示 -->
  <div class="resultArea">
    <template v-if="isSettled">
      <div v-if="result" class="resultCorrect">正解です！！</div>
      <div v-else-if="isShowAnswer" class="resultWrong">正解を表示します</div>
      <div v-else class="resultWrong">残念、不正解・・・</div>
    </template>
    <template v-else>
      <div class="buttonArea">
        <button @click="onRestart">再戦</button>
        <button @click="onJudge">判定</button>
        <button @click="onShowAnswer">解答表示</button>
      </div>
    </template>
  </div>

  <!-- 盤面 -->
  <div class="board" :class="{ settled: isSettled }">
    <div
      v-for="(cell, index) in flatBoard"
      :key="index"
      class="cell"
      :class="{ 'cell-active': selectedCellIndex === index }"
    >
      <span v-if="cell.fixed" class="fixedCell">{{ cell.value }}</span>
      <template v-else>
        <input
          v-model="cell.value"
          maxlength="1"
          type="text"
          class="inputCell"
          :class="{ isCorrect: cell.answer, inputWrong: !cell.answer }"
          :disabled="isSettled"
          @input="onInputCheck($event, cell)"
        />

        <!-- メモボタン -->
        <button class="memoButton" @click="openMemo(index, $event)">📝</button>

        <!-- メモの表示 -->
        <div v-if="cell.memo.length" class="memoDisplay">
          <span v-for="n in cell.memo" :key="n">{{ n }}</span>
        </div>
      </template>
    </div>
  </div>

  <!-- メモモーダル -->
  <NumberPlaceMemoModal
    class="memoModal"
    v-if="showMemoModal && selectedCellIndex !== null"
    :cell-memo="flatBoard[selectedCellIndex].memo"
    :style="{ top: memoModalPos.top + 'px', left: memoModalPos.left + 'px' }"
    @update:memo="(newMemo) => (flatBoard[selectedCellIndex!].memo = newMemo)"
    @close="closeMemo"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useNumberPlaceBoard, cloneBoard } from '@/composables/board/useBoard'
import type { Cell } from '@/types'
import NumberPlaceMemoModal from './NumberPlaceMemoModal.vue'

// ---- 入力欄（空欄数） ----
const emptyCountRef = ref<HTMLInputElement | null>(null)

// ---- 盤面管理 ----
const boardSize = 9
const emptyCellsDefault = 45
let { board, resetBoard, getAnswerValue } = useNumberPlaceBoard(emptyCellsDefault)
const flatBoard = computed(() => board.value.flat())

// 初期盤面のコピーを保持
let initialBoardState: Cell[][] = cloneBoard(board.value)

// ---- メモモーダル管理 ----
const showMemoModal = ref(false)
const selectedCellIndex = ref<number | null>(null)
const memoModalPos = ref({ top: 0, left: 0 })
const openMemo = (index: number, event: MouseEvent) => {
  const btnRect = (event.target as HTMLElement).getBoundingClientRect()
  const modalHeight = 120

  let top: number
  const left = btnRect.right + 3

  // 下方向に十分余裕があるなら下に出す
  if (btnRect.bottom + modalHeight <= window.innerHeight) {
    top = btnRect.top - 2
  } else {
    // 下に余裕がなければセルの上側に出す
    top = btnRect.top - modalHeight
  }

  memoModalPos.value = {
    top: top,
    left: left,
  }
  selectedCellIndex.value = index
  showMemoModal.value = true
}
const closeMemo = () => {
  selectedCellIndex.value = null
  showMemoModal.value = false
}

// 初期状態に戻す
const resetGameState = () => {
  // 初期盤面を復元
  board.value = cloneBoard(initialBoardState)

  // 状態リセット
  isSettled.value = false
  result.value = true
  isShowAnswer.value = false
  showMemoModal.value = false
  selectedCellIndex.value = null
}

// ---- 判定結果状態 ----
const isSettled = ref(false)
const result = ref(true)
const isShowAnswer = ref(false)

// ---- 問題生成 ----
const onGenerate = () => {
  const val = parseInt(emptyCountRef.value?.value || `${emptyCellsDefault}`, 10)
  const emptyCount = Math.max(1, Math.min(72, isNaN(val) ? emptyCellsDefault : val))

  // 新しいインスタンスを生成
  const instance = useNumberPlaceBoard(emptyCount)
  board.value = instance.board.value
  resetBoard = instance.resetBoard
  getAnswerValue = instance.getAnswerValue

  // 生成後に初期盤面をコピー
  initialBoardState = cloneBoard(board.value)

  // 状態をリセット
  resetGameState()
}

// 再戦
const onRestart = () => {
  resetGameState()
}

// 回答を判定
const onJudge = () => {
  result.value = true
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const answer = getAnswerValue(row, col)
      const check = board.value[row][col].value === answer
      board.value[row][col].answer = check

      if (!check) {
        result.value = false
      }
    }
  }

  isSettled.value = true
  showMemoModal.value = false
  selectedCellIndex.value = null
}

// 解答を表示
const onShowAnswer = () => {
  for (let row = 0; row < boardSize; row++) {
    for (let col = 0; col < boardSize; col++) {
      const correctValue = getAnswerValue(row, col)
      const cell = board.value[row][col]
      cell.value = correctValue
      cell.answer = false
      cell.memo = []
    }
  }

  result.value = false
  isSettled.value = true
  isShowAnswer.value = true
  showMemoModal.value = false
  selectedCellIndex.value = null
}

// 入力チェック
// 入力できるのは 1 ~ 9 の数字のみ
const onInputCheck = (event: Event, cell: Cell) => {
  const target = event.target as HTMLInputElement
  const value = target.value

  if (/^[1-9]$/.test(value)) {
    cell.value = value
    cell.memo = []
  } else {
    cell.value = ''
  }
}
</script>

<style scoped>
.generateArea {
  margin-bottom: 10px;
  display: flex;
  gap: 6px;
  justify-content: center;
}

.generateArea input[type='number'] {
  width: 64px;
}

.resultArea {
  height: 50px;
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
}

.resultCorrect {
  font-family: 'Segoe UI', sans-serif;
  font-size: 26px;
  color: #28a745;
  font-weight: bold;
  animation: correctFlash 1s ease-in-out;
}

@keyframes correctFlash {
  0% {
    transform: scale(1);
    color: #28a745;
  }
  50% {
    transform: scale(1.2);
    color: #3eea75;
  }
  100% {
    transform: scale(1);
    color: #28a745;
  }
}

.resultWrong {
  font-family: 'Comic Sans MS', cursive;
  font-size: 24px;
  color: #b00;
  font-style: italic;
}

.buttonArea {
  height: 28px;
  display: flex;
  gap: 8px; /* ボタン間の隙間を8pxに */
  justify-content: center; /* 全体を中央寄せ */
}

.board {
  display: grid;
  grid-template-columns: repeat(9, 64px);
  grid-template-rows: repeat(9, 64px);
  gap: 0;
  border: 2px solid #333;
}

.cell {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border: 1px solid #999;
  font-size: 24px;
  font-weight: bold;
  box-sizing: border-box;
  position: relative;
}

.cell-active {
  border: 2px solid #4cafef;
  box-shadow: 0 0 8px #4cafef;
  transition:
    box-shadow 0.3s,
    border-color 0.3s;
}

.memoButton {
  position: absolute;
  top: 2px;
  right: 2px;
  font-size: 4px;
  padding: 2px;
}

.memoDisplay {
  position: absolute;
  top: 2px;
  left: 6px;
  font-size: 12px;
  color: gray;
  display: grid;
  grid-template-columns: repeat(3, 1fr); /* 3列 */
  gap: 1px;
}

/* 太い線で 3x3 のブロックで囲む */
/* 左端に太い線 */
.cell:nth-child(9n + 4),
.cell:nth-child(9n + 7) {
  border-left: 2px solid #333;
}
/* 上端に太い線 */
.cell:nth-child(n + 28):nth-child(-n + 36),
.cell:nth-child(n + 55):nth-child(-n + 63) {
  border-top: 2px solid #333;
}

.cell:hover {
  background-color: #38a9d9;
}

.fixedCell {
  font-size: 32px;
  font-weight: 300;
}

.inputCell {
  font-size: 40px;
  font-weight: bold;
  height: 100%;
  width: 100%;
  border: none;
  text-align: center;
}

.board.settled {
  .cell:hover {
    background-color: inherit;
  }

  .isCorrect {
    background-color: #c3e6cb;
  }

  .inputWrong {
    background-color: red;
  }
}
</style>
