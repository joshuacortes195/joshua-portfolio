import { useState, useEffect } from 'react'
import { ArrowRight } from 'lucide-react'

const FULL_TEXT = "console.log('Hello, World! 👋');"

export default function Hero() {
  const [typed, setTyped] = useState('')

  useEffect(() => {
    const chars = Array.from(FULL_TEXT)
    let i = 0
    const interval = setInterval(() => {
      i++
      setTyped(chars.slice(0, i).join(''))
      if (i >= chars.length) clearInterval(interval)
    }, 70)
    return () => clearInterval(interval)
  }, [])

  return (
    <section>
      <div className="mx-auto flex min-h-[90vh] max-w-7xl flex-col items-center justify-center px-8 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
          Hi, I'm Joshua Cortes
        </h1>
        <p className="mt-4 text-lg text-neutral-500 sm:text-xl">
          Full-Stack Developer / Software Engineer
        </p>
        <div className="mt-8 rounded-lg border border-neutral-200 bg-white px-5 py-3 font-mono text-sm shadow-sm">
          <span className="text-neutral-400">$ </span>
          <span className="text-neutral-700">{typed}</span>
          <span className="ml-0.5 inline-block animate-pulse text-neutral-700">|</span>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a href="#projects" className="inline-flex items-center gap-2 rounded-lg bg-neutral-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800">
            View My Work
            <ArrowRight className="h-4 w-4" />
          </a>
          <a href="#contact" className="rounded-lg border border-neutral-300 bg-white px-6 py-3 text-sm font-semibold transition-colors hover:bg-neutral-50">
            Get In Touch
          </a>
        </div>
      </div>
    </section>
  )
}