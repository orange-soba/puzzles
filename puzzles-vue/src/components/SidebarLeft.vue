<!-- <template>
  <header class="header">
    <h1>パズル</h1>
    <div class="links">
      <RouterLink to="/">Home</RouterLink> | <RouterLink to="/puzzles">パズル集</RouterLink>
    </div>
  </header>
</template> -->
<template>
  <aside class="sidebarLeft">
    <h1>THE パズル</h1>
    <ul class="puzzleLinks">
      <li>
        <RouterLink to="/">Home</RouterLink>
      </li>
      <li class="puzzleMenu">
        <div @click="togglePuzzleMenu">
          {{ isPuzzleMenuOpen ? '▼' : '▶' }}
        </div>
        <RouterLink to="/puzzles"> パズル集 </RouterLink>
      </li>
      <ul v-if="isPuzzleMenuOpen">
        <!-- <RouterLink to="/puzzles/marubatsu">マルバツゲーム</RouterLink> -->
        <li v-for="(link, index) in puzzleMenuLinks" :key="index">
          <RouterLink :to="link.link">{{ link.display }}</RouterLink>
        </li>
      </ul>
    </ul>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isPuzzleMenuOpen = ref(false)
const togglePuzzleMenu = () => {
  isPuzzleMenuOpen.value = !isPuzzleMenuOpen.value
}

const puzzleMenuLinks = [
  { link: '/puzzles/marubatsu', display: 'マルバツゲーム' },
  { link: '/puzzles/gomoku', display: '五目並べ' },
  { link: '/puzzles/numberplace', display: 'ナンプレ' },
  { link: '/puzzles/2048', display: '2048' },
  { link: '/puzzles/crossword', display: 'クロスワード' },
]
</script>

<style scoped>
.sidebarLeft {
  width: 250px;
  height: 100vh;
  background-color: blueviolet;
  color: white;
  padding: 20px;
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;

  h1 {
    font-size: 36px;
    font-weight: bold;
  }

  .puzzleLinks {
    list-style: none;
    padding-left: 0;

    li {
      font-size: 24px;
      margin-left: 10px 0;
    }

    .puzzleMenu {
      display: flex;
    }
  }
}
</style>
