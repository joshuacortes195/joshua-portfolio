import { reducedMotion } from './motion'

const KEY = 'jc-booted'

// the intro plays once per tab session, and never with reduced motion
export function shouldBoot() {
  if (reducedMotion()) return false
  try {
    return sessionStorage.getItem(KEY) === null
  } catch {
    return false
  }
}

// remembers that the intro already played
export function markBooted() {
  try {
    sessionStorage.setItem(KEY, '1')
  } catch {
    // storage blocked, intro just plays again next load
  }
}
