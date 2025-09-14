<template>
  <div class="modal">
    <div class="modalContent">
      <h3>メモ入力</h3>
      <div class="numberPad">
        <button
          v-for="n in 9"
          :key="n"
          :class="{ selected: cellMemo.includes(n) }"
          @click="toggleMemo(n)"
        >
          {{ n }}
        </button>
      </div>
      <div class="closeButton">
        <button @click="$emit('close')">閉じる</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  cellMemo: number[]
}>()

const emits = defineEmits<{
  (e: 'update:memo', newMemo: number[]): void
  (e: 'close'): void
}>()

const localMemo = ref<number[]>([])
watch(
  () => props.cellMemo,
  (val) => {
    localMemo.value = [...val]
  },
  { immediate: true },
)

const toggleMemo = (n: number) => {
  if (localMemo.value.includes(n)) {
    localMemo.value = localMemo.value.filter((v) => v !== n)
  } else {
    localMemo.value.push(n)
    localMemo.value.sort((a, b) => a - b)
  }
  emits('update:memo', localMemo.value)
}
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modalContent {
  background: white;
  padding: 16px;
  border-radius: 8px;
  border: solid 1px #32a1ce;
}

.numberPad {
  display: grid;
  grid-template-columns: repeat(3, 40px);
  gap: 5px;
}

.numberPad button.selected {
  background: #4caf50;
  color: white;
}

.closeButton {
  display: flex;
  justify-content: center;
  padding-top: 5px;
}
</style>
