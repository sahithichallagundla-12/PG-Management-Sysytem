import { Variants, TargetAndTransition } from "framer-motion"

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.5, ease: "easeOut" }
  }
}

export const slideUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

export const cardHover: TargetAndTransition = {
  scale: 1.02,
  y: -5,
  boxShadow: "0 20px 40px -12px rgba(79, 124, 130, 0.15), 0 8px 16px -8px rgba(79, 124, 130, 0.1)",
  transition: { duration: 0.3, ease: "easeOut" }
}
