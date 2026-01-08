import { useState, useEffect, useRef } from 'react'

/**
 * Custom hook for scroll-triggered animations using Intersection Observer
 * @param {Object} options - Configuration options
 * @param {number} options.threshold - Percentage of element visible before trigger (0-1, default 0.2)
 * @param {boolean} options.triggerOnce - If true, animation only triggers once (default true)
 * @returns {[React.RefObject, boolean]} - [ref to attach to element, isVisible state]
 */
export function useScrollAnimation(options = {}) {
  const { threshold = 0.2, triggerOnce = true } = options
  const [isVisible, setIsVisible] = useState(false)
  const elementRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (triggerOnce) {
            observer.disconnect()
          }
        } else if (!triggerOnce) {
          setIsVisible(false)
        }
      },
      {
        threshold
      }
    )

    const element = elementRef.current
    if (element) {
      observer.observe(element)
    }

    return () => {
      if (element && observer) {
        observer.unobserve(element)
      }
    }
  }, [threshold, triggerOnce])

  return [elementRef, isVisible]
}
