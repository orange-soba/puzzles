<template>
  <div class="title">
    <h1>クロスワードパズル</h1>
  </div>
  <div class="container">
    <!-- 左側: 盤面 -->
    <div class="left-board">
      <div class="input-placeholder">
        <div>答えを入力(ヒントをクリックしてから入力して下さい)</div>
        <input
          ref="inputFocus"
          type="text"
          v-model="inputEntry"
          placeholder="ひらがな・カタカナのみ"
          @keydown.enter="onKeydownEnter"
          @compositionstart="isComposing = true"
          @compositionend="onCompositionEnd"
        />
      </div>
      <div class="buttons">
        <button @click="submitAnswer">解答</button>
        <button @click="clearBoard">盤面クリア</button>
        <button @click="openCreateModal">問題生成</button>
      </div>

      <div class="board">
        <div v-for="(row, rowIndex) in board" :key="rowIndex" class="boardRow">
          <div
            v-for="(cell, colIndex) in row"
            :key="colIndex"
            class="boardCell"
            :class="{ black: cell.isBlack }"
            :style="{ color: cell.color || 'black' }"
          >
            <span class="cell-number" v-if="cell.number !== null">{{ cell.number }}</span>
            <span v-if="cell.letter">{{ cell.letter }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 右側: 回答入力欄 + ヒント -->
    <div class="right-panel">
      <div class="hint-placeholder">
        <div>
          <h2>タテのヒント</h2>
          <ul>
            <li
              v-for="hintNum in verticalHintNumsFiltered"
              :key="'v-' + hintNum"
              :class="{
                selected:
                  selectedHint?.direction === 'vertical' && selectedHint?.hintNum === hintNum,
              }"
              @click="focusInput('vertical', hintNum)"
            >
              {{ hintNum }}: {{ crossWordAnswers['vertical'][hintNum]?.hint }}
            </li>
          </ul>
        </div>
        <div>
          <h2>ヨコのヒント</h2>
          <ul>
            <li
              v-for="hintNum in horizontalHintNumsFiltered"
              :key="'h-' + hintNum"
              :class="{
                selected:
                  selectedHint?.direction === 'horizontal' && selectedHint?.hintNum === hintNum,
              }"
              @click="focusInput('horizontal', hintNum)"
            >
              {{ hintNum }}: {{ crossWordAnswers['horizontal'][hintNum]?.hint }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- 問題生成モーダル -->
  <div v-if="showCreateModal" class="modalBackdrop">
    <div class="modalContent">
      <h2>問題生成</h2>

      <div v-for="(entry, index) in newEntries" :key="index" class="entryRow">
        <div class="entryField">
          <label>ワード</label>
          <input
            type="text"
            v-model="entry.answer"
            placeholder="ワードを入力"
            @input="entry.answer = toKatakanaOnly(entry.answer)"
          />
        </div>
        <div class="entryField">
          <label>ヒント</label>
          <input type="text" v-model="entry.hint" placeholder="ヒントを入力" />
        </div>
      </div>

      <button @click="closeCreateModal">閉じる</button>
      <button @click="submitNewEntries">問題作成</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { createCrossWordBoard, createFalseGrid } from '@/composables/board/useBoard'
import { createCrosswordFromEntries } from '@/composables/board/useCrossword'
import { type Hints, type CrossWordAnswers } from '@/types'

const rows = 7
const cols = 7
const board = ref(createCrossWordBoard(rows, cols))

const crossWordAnswers: CrossWordAnswers = {
  vertical: {
    1: { answer: 'ハナ', hint: '植物の一部で美しい色や香りが特徴' },
    2: { answer: 'ネコバス', hint: '「となりのトトロ」に登場する不思議なバス' },
    3: { answer: 'エドザ', hint: '江戸で都会趣味的な洒落と機知とを主とする句を作った俳諧の一派' },
    4: { answer: 'カマクラ', hint: '神奈川県の歴史ある都市。〇〇大仏' },
    5: { answer: 'イス', hint: '座るための家具' },
    7: { answer: 'ウルウドシ', hint: '2月が29日まである年' },
    10: { answer: 'ツメミガキ', hint: '爪の表面を磨いて艶を出し、見た目を整えること' },
    11: { answer: 'キキコミ', hint: '調査のために、様々な人の話を聞くこと' },
    13: { answer: 'ミチスジ', hint: '通って行く道。コース' },
    15: { answer: 'レツイ', hint: '他より遅れをとった位置や立場' },
    17: { answer: 'ウミ', hint: '全ての生命の母。しょっぱい' },
    18: { answer: 'ラス', hint: '建築や左官工事で使われる、モルタルなどの塗り壁の下地となる金網' },
  },
  horizontal: {
    1: { answer: 'ハネ', hint: '鳥や虫の翼' },
    3: { answer: 'エンカイ', hint: '飲食を伴う集まり' },
    6: { answer: 'ナコウド', hint: '結婚の媒酌人' },
    8: { answer: 'マス', hint: '魚の種類。ニジ〇〇' },
    9: { answer: 'バルザック', hint: 'モンバーバラの姉妹の仇敵' },
    11: { answer: 'キスウ', hint: '2で割り切れない数' },
    12: { answer: 'メラミ', hint: 'メラの上位魔法' },
    14: { answer: 'ドレミ', hint: '音の呼び名。〇〇〇ファソラシド' },
    16: { answer: 'コウシツガラス', hint: '軟化温度が高く、熱による膨張・収縮が少ないガラスの' },
    19: { answer: 'ミミ', hint: '音を聞く場所' },
    20: { answer: 'イキスジ', hint: '力を入れた時に、顔に出る筋' },
  },
}

const inputEntry = ref('')
const inputFocus = ref()

const hintsInfo: { vertical: Hints; horizontal: Hints } = {
  vertical: {},
  horizontal: {},
}
const hintNums = {
  vertical: [] as number[],
  horizontal: [] as number[],
}
// マスにヒントのための数値の割り振りを行う。
const assignNumberToBoard = (rows: number, cols: number) => {
  const verticalCheckGrid = createFalseGrid(rows, cols)
  const horizontalCheckGrid = createFalseGrid(rows, cols)
  let cellNum = 1
  let count = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // マス自体が黒マスの時、マスの数字の設定が終わっている場合はスキップ。
      if (board.value[r][c].isBlack) {
        continue
      }

      // 縦のチェック
      // マスの数字の設定が終わっていない、かつすぐ下のマスが黒マスでない場合。
      if (!verticalCheckGrid[r][c] && r < rows - 1 && !board.value[r + 1][c].isBlack) {
        // 数値の登録
        board.value[r][c].number = cellNum++

        // 下側のマスが黒マスになるまでマスの数字の設定を終了済みにする。
        // ヒント情報のための文字数のカウントも並行して行う。
        count = 0
        for (let i = r; i < rows; i++) {
          if (board.value[i][c].isBlack) {
            break
          }
          count++
          verticalCheckGrid[i][c] = true
        }

        const hintNum = cellNum - 1
        hintsInfo['vertical'][hintNum] = {
          count: count,
          position: { row: r, col: c },
        }
        hintNums['vertical'].push(hintNum)
      }

      // 横のチェック
      // マスの数字の設定が終わっていない、かつ右隣のマスが黒マスでない場合。
      if (!horizontalCheckGrid[r][c] && c < cols - 1 && !board.value[r][c + 1].isBlack) {
        // 数値の登録
        if (board.value[r][c].number === null) {
          board.value[r][c].number = cellNum++
        }

        // 右側のマスが黒マスになるまでマスの数字の設定を終了済みにする。
        // ヒント情報のための文字数のカウントも並行して行う。
        count = 0
        for (let i = c; i < cols; i++) {
          if (board.value[r][i].isBlack) {
            break
          }
          count++
          horizontalCheckGrid[r][i] = true
        }

        const hintNum = cellNum - 1
        hintsInfo['horizontal'][hintNum] = {
          count: count,
          position: { row: r, col: c },
        }
        hintNums['horizontal'].push(hintNum)
      }
    }
  }
}

assignNumberToBoard(rows, cols)

const selectedHint = ref<{
  direction: string
  hintNum: number
  position: { row: number; col: number }
} | null>()

const focusInput = (direction: string, hintNum: number) => {
  inputFocus.value.focus()

  let hintInfo
  if (direction === 'vertical') {
    hintInfo = hintsInfo['vertical'][hintNum]
  } else {
    hintInfo = hintsInfo['horizontal'][hintNum]
  }
  const position = hintInfo['position']
  selectedHint.value = { direction, hintNum, position }
}

const isComposing = ref(false)

const onCompositionEnd = () => {
  isComposing.value = false
}

const onKeydownEnter = () => {
  if (isComposing.value) return
  inputAnswer()
}

const toKatakana = (str: string): string => {
  return str.replace(/[\u3041-\u3096]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) + 0x60))
}

const toKatakanaOnly = (str: string) => {
  const katakana = str.replace(/[\u3041-\u3096]/g, (ch) =>
    String.fromCharCode(ch.charCodeAt(0) + 0x60),
  )
  // カタカナ以外は削除
  return katakana.replace(/[^ァ-ンー]/g, '')
}

const convertInputToKatakanaArray = (input: string): string[] => {
  const katakana = toKatakana(input)

  if (/[^ァ-ンー]/.test(katakana)) {
    return []
  }

  return katakana.split('')
}

const inputAnswer = () => {
  if (!selectedHint.value) return
  if (!inputEntry.value) return

  const answerArray = convertInputToKatakanaArray(inputEntry.value)
  if (!answerArray) return

  // 盤面への埋め込み処理
  const { direction, hintNum, position } = selectedHint.value
  let count
  if (direction == 'vertical') {
    count = hintsInfo['vertical'][hintNum].count

    for (let i = 0; i < count; i++) {
      const r = position.row + i
      const c = position.col

      if (r >= rows || c >= cols || board.value[r][c].isBlack) break

      board.value[r][c].letter = answerArray[i]
    }
  } else {
    count = hintsInfo['horizontal'][hintNum].count

    for (let i = 0; i < count; i++) {
      const r = position.row
      const c = position.col + i

      if (r >= rows || c >= cols || board.value[r][c].isBlack) break

      board.value[r][c].letter = answerArray[i]
    }
  }

  inputEntry.value = ''
}

const clearBoard = () => {
  if (!confirm('本当に盤面をクリアしますか？')) {
    return
  }

  // 盤面の初期化
  board.value = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => ({
      letter: '',
      isBlack: board.value[r][c].isBlack, // 黒マスは保持
      number: board.value[r][c].number, // 数字は保持
      color: undefined, // 色をリセット
    })),
  )

  inputEntry.value = ''
  selectedHint.value = null
}

// // 解答を表示する
// const showSolution = () => {
//   // 縦の答えを埋める
//   for (const [num, entry] of Object.entries(crossWordAnswers.vertical)) {
//     const { position } = hintsInfo.vertical[Number(num)]
//     const { row, col } = position
//     const word = entry.answer
//     for (let i = 0; i < word.length; i++) {
//       if (row + i < rows && col < cols && !board.value[row + i][col].isBlack) {
//         board.value[row + i][col].letter = word[i]
//       }
//     }
//   }

//   // 横の答えを埋める
//   for (const [num, entry] of Object.entries(crossWordAnswers.horizontal)) {
//     const { position } = hintsInfo.horizontal[Number(num)]
//     const { row, col } = position
//     const word = entry.answer
//     for (let i = 0; i < word.length; i++) {
//       if (row < rows && col + i < cols && !board.value[row][col + i].isBlack) {
//         board.value[row][col + i].letter = word[i]
//       }
//     }
//   }
// }

const submitAnswer = () => {
  // ユーザー入力のコピーを作成(正誤判定用)
  const userInputBoard = board.value.map((row) => row.map((cell) => cell.letter))

  let allCorrect = true

  // 縦・横のヒントごとに回答をチェック
  for (const direction of ['vertical', 'horizontal'] as const) {
    for (const hintNum of hintNums[direction]) {
      const expected = crossWordAnswers[direction][hintNum].answer
      const { position } = hintsInfo[direction][hintNum]
      const count = hintsInfo[direction][hintNum].count

      if (direction === 'vertical') {
        for (let i = 0; i < count; i++) {
          const userLetter = userInputBoard[position.row + i][position.col]
          const cell = board.value[position.row + i][position.col]

          if (userLetter === expected[i]) {
            cell.color = 'green' // 正解色
          } else {
            cell.letter = expected[i] // 正解を自動入力
            cell.color = 'red' // 不正解色
            allCorrect = false
          }
        }
      } else {
        // horizontal
        for (let i = 0; i < count; i++) {
          const userLetter = userInputBoard[position.row][position.col + i]
          const cell = board.value[position.row][position.col + i]
          if (userLetter === expected[i]) {
            cell.color = 'green'
          } else {
            cell.letter = expected[i] //正解を自動入力
            cell.color = 'red' // 不正解色
            allCorrect = false
          }
        }
      }
    }
  }

  // 結果の通知
  if (allCorrect) {
    alert('全問正解です！おめでとう🎉')
  } else {
    alert('残念、不正解です')
  }
}

// 問題自動生成機能
const showCreateModal = ref(false)

const openCreateModal = () => {
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
}

const newEntries = ref(Array.from({ length: 10 }, () => ({ answer: '', hint: '' })))

const submitNewEntries = () => {
  createCrosswordFromEntries({
    newEntries: newEntries.value,
    board,
    rows,
    cols,
    crossWordAnswers,
    hintNums,
    showCreateModal,
    toKatakanaOnly,
  })

  console.log(board.value)

  // generateHintNums()
  // verticalHintNumsFiltered.value = hintNums.vertical
  // horizontalHintNumsFiltered.value = hintNums.horizontal
}

const verticalHintNumsFiltered = computed(() =>
  Object.entries(crossWordAnswers.vertical)
    .filter(([_, v]) => v.hint && v.hint.trim() !== '') // 空ヒントを除外
    .map(([num]) => Number(num))
    .sort((a, b) => a - b),
)

const horizontalHintNumsFiltered = computed(() =>
  Object.entries(crossWordAnswers.horizontal)
    .filter(([_, v]) => v.hint && v.hint.trim() !== '') // 空ヒントを除外
    .map(([num]) => Number(num))
    .sort((a, b) => a - b),
)

// watch(
//   [() => hintNums.vertical, () => crossWordAnswers.vertical],
//   () => {
//     verticalHintNumsFiltered.value = hintNums.vertical
//       .filter((num) => {
//         const hint = crossWordAnswers.vertical[num]?.hint
//         return hint && hint.trim() !== '' // 空文字・空白は除外
//       })
//       .sort((a, b) => a - b) // 数字順にソート
//   },
//   { deep: true, immediate: true },
// )

// watch(
//   [() => hintNums.horizontal, () => crossWordAnswers.horizontal],
//   () => {
//     horizontalHintNumsFiltered.value = hintNums.horizontal
//       .filter((num) => {
//         const hint = crossWordAnswers.horizontal[num]?.hint
//         return hint && hint.trim() !== '' // 空文字・空白は除外
//       })
//       .sort((a, b) => a - b) // 数字順にソート
//   },
//   { deep: true, immediate: true },
// )

// ヒント番号を crossWordAnswers に基づき生成（空ヒントは除外）
// const generateHintNums = () => {
//   hintNums.vertical = []
//   hintNums.horizontal = []

//   hintNums.vertical = Object.entries(crossWordAnswers.vertical)
//     .filter(([_, v]) => v.hint && v.hint.trim() !== '') // hint が空なら除外
//     .map(([num]) => Number(num))

//   hintNums.horizontal = Object.entries(crossWordAnswers.horizontal)
//     .filter(([_, v]) => v.hint && v.hint.trim() !== '') // hint が空なら除外
//     .map(([num]) => Number(num))
// }

// 初期化時
// generateHintNums()

// watchEffect(() => {
//   console.log('verticalHintNumsFiltered:', verticalHintNumsFiltered.value)
//   console.log('horizontalHintNumsFiltered:', horizontalHintNumsFiltered.value)
// })
</script>

<style scoped>
.container {
  display: flex;
  width: 1000px;
  height: 600px;
}

.left-board {
  width: 50%;
  padding: 5px auto;
  background: #f3f4f6;
  display: flex;
  flex-direction: column;
}

.input-placeholder {
  margin: 0 auto;
  font-size: 1.125rem;
  margin-bottom: 1rem;
}

.input-placeholder input {
  width: 300px;
  height: 50px;
  margin: 0 auto;
  font-size: 1.25rem;
  padding: 0 12px;
  border: 2px solid #ccc;
  border-radius: 6px;
}

.buttons {
  margin: 0 auto;
  display: flex;
  gap: 10px;
}

.buttons button {
  padding: 4px 16px;
  font-size: 0.75rem;
  border: 1px solid #888;
  border-radius: 6px;
  background: #f7fafc;
  cursor: pointer;
}

.buttons button:hover {
  background: #e2e8f0;
}

.board {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px;
  width: fit-content;
  margin: 5px auto;
}

.boardRow {
  display: flex;
  gap: 2px;
}

.boardCell {
  width: 60px;
  height: 60px;
  background: white;
  border: 1px solid #ccc;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  position: relative;
}

.cell-number {
  position: absolute;
  top: 2px;
  left: 4px;
  font-size: 0.7rem;
  color: #333;
}

.boardCell.black {
  background: black;
}

.right-panel {
  width: 50%;
  background: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.hint-placeholder {
  font-size: 0.9rem;
  color: #718096;
  overflow: scroll;
}

.hint-placeholder li {
  list-style: none;
}

.hint-placeholder li.selected {
  background: #bee3f8;
  border-radius: 4px;
}

.modalBackdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modalContent {
  background: white;
  padding: 20px;
  border-radius: 8px;
  min-width: 300px;
}

.entryRow {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 10px;

  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #f9f9f9;
}

.entryField {
  display: flex;
  align-items: center;
  gap: 8px;
}

.entryField label {
  width: 70px;
  flex-shrink: 0;
}

.entryField input {
  flex: 1;
  padding: 6px;
  box-sizing: border-box;
}
</style>
