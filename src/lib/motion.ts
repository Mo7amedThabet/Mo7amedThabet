import type { Transition, Variants } from "framer-motion";

/** Soft easing for portfolio-wide micro-animations */
export const gentleEase = [0.22, 1, 0.36, 1] as const;

export const gentleTransition: Transition = {
  duration: 0.5,
  ease: gentleEase,
};

export const quickTransition: Transition = {
  duration: 0.35,
  ease: gentleEase,
};

export const viewport = {
  once: true,
  margin: "-48px 0px",
} as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: gentleTransition,
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: gentleTransition },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: { opacity: 1, scale: 1, transition: gentleTransition },
};

export const slideLeft: Variants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: gentleTransition },
};

export const slideRight: Variants = {
  hidden: { opacity: 0, x: 24 },
  visible: { opacity: 1, x: 0, transition: gentleTransition },
};

export const stagger: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: quickTransition,
  },
};

/** Subtle idle float (y-axis) */
export const floatY = {
  y: [0, -7, 0],
  transition: {
    duration: 5,
    repeat: Infinity,
    ease: "easeInOut" as const,
  },
};

export const hoverLift = {
  y: -5,
  scale: 1.02,
  transition: quickTransition,
};

export const tapPress = { scale: 0.97 };
