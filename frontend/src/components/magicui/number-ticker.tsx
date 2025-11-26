import { useEffect, useRef, useState } from "react"
import { motion, useInView, useSpring, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

interface NumberTickerProps {
  value: number
  direction?: "up" | "down"
  delay?: number
  className?: string
  decimalPlaces?: number
  suffix?: string
  prefix?: string
}

export function NumberTicker({
  value,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
  suffix = "",
  prefix = "",
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [hasAnimated, setHasAnimated] = useState(false)

  const spring = useSpring(direction === "down" ? value : 0, {
    stiffness: 100,
    damping: 30,
    duration: 1,
  })

  const display = useTransform(spring, (current) =>
    Math.abs(current).toFixed(decimalPlaces)
  )

  useEffect(() => {
    if (isInView && !hasAnimated) {
      setTimeout(() => {
        spring.set(direction === "down" ? 0 : value)
        setHasAnimated(true)
      }, delay * 1000)
    }
  }, [isInView, delay, value, direction, spring, hasAnimated])

  useEffect(() => {
    if (hasAnimated) {
      spring.set(value)
    }
  }, [value, hasAnimated, spring])

  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center tabular-nums tracking-tight",
        className
      )}
    >
      {prefix}
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  )
}
