import { ref, onMounted, onUnmounted } from 'vue'

export function useSparkle() {
  const colors = ['#ff0', '#fff', '#f0f', '#0ff']
  const randomColor = () => colors[Math.floor(Math.random() * colors.length)]

  const sparkleStyle = ref({
    color: randomColor(),
    textShadow: `0 0 10px ${randomColor()}, 0 0 20px ${randomColor()}`,
  })

  let intervalId: number | null = null

  const updateSparkle = () => {
    sparkleStyle.value = {
      color: randomColor(),
      textShadow: `0 0 10px ${randomColor()}, 0 0 20px ${randomColor()}`,
    }
  }

  onMounted(() => {
    intervalId = setInterval(updateSparkle, 500)
  })

  onUnmounted(() => {
    if (intervalId !== null) clearInterval(intervalId)
  })

  return { sparkleStyle }
}
