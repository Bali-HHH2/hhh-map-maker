import { computed, onMounted, onUnmounted, reactive } from 'vue'
import GlobalCss from '@/common/style/Global.module.scss'
const { mobileWidth } = GlobalCss

const cssStringToNumber = (cssString: string): number => {
  return parseInt(cssString.replace(/^\D+/g, ''))
}

export const useWindowDimensions = () => {
  const windowDimensions = reactive({
    width: window.innerWidth,
    height: window.innerHeight
  })

  const updateDimensions = () => {
    windowDimensions.width = window.innerWidth
    windowDimensions.height = window.innerHeight
  }

  onMounted(() => {
    window.addEventListener('resize', updateDimensions)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateDimensions)
  })

  return windowDimensions
}

// Used to determine if window is less than 800px in width
export const useIsMobile = () => {
  const windowDimensions = useWindowDimensions()
  return computed(
    () => windowDimensions.width <= cssStringToNumber(mobileWidth)
  )
}
