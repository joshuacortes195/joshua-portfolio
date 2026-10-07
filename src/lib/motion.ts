import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { Flip } from 'gsap/Flip'
import { useGSAP } from '@gsap/react'

// turns on the gsap plugins once for the whole app
gsap.registerPlugin(ScrollTrigger, SplitText, Flip, useGSAP)

// true when the visitor asked for less motion
export const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches

// true on desktop with a real mouse
export const finePointer = () => window.matchMedia('(pointer: fine)').matches

export { gsap, ScrollTrigger, SplitText, Flip, useGSAP }
