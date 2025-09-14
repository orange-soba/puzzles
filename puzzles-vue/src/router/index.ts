import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/home/HomePage.vue'
import GomokuNarabe from '@/pages/puzzles/GomokuNarabe.vue'
import MaruBatsu from '@/pages/puzzles/MaruBatsu.vue'
import PuzzlesHome from '@/pages/puzzles/PuzzlesHome.vue'
import NumberPlace from '@/pages/puzzles/NumberPlace.vue'
import Game2048Page from '@/pages/puzzles/Game2048Page.vue'
import CrossWord from '@/pages/puzzles/CrossWord.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: HomePage,
    },
    {
      path: '/puzzles',
      component: PuzzlesHome,
    },
    {
      path: '/puzzles/marubatsu',
      component: MaruBatsu,
    },
    {
      path: '/puzzles/gomoku',
      component: GomokuNarabe,
    },
    {
      path: '/puzzles/numberplace',
      component: NumberPlace,
    },
    {
      path: '/puzzles/2048',
      component: Game2048Page,
    },
    {
      path: '/puzzles/crossword',
      component: CrossWord,
    },
  ],
})

export default router
