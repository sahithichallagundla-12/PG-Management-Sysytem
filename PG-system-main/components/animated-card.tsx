"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"
import { cardHover, slideUp } from "@/lib/motions"
import { cn } from "@/lib/utils"

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function AnimatedCard({ children, className, delay = 0 }: AnimatedCardProps) {
  return (
    <motion.div
      variants={slideUp}
      whileHover={cardHover}
      className="h-full"
    >
      <div className={cn(
        "h-full w-full overflow-hidden rounded-2xl border border-border/40",
        "bg-white/70 backdrop-blur-md shadow-md",
        "transition-all duration-300",
        className
      )}>
        {children}
      </div>
    </motion.div>
  )
}
