import { useState } from 'react'
import { Mail } from 'lucide-react'

const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY
const EMAIL = 'joshuacortes195@gmail.com'

function GithubIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.37-3.37-1.37-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.62.07-.62 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.36-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.27 2.75 1.05a9.36 9.36 0 0 1 5 0c1.91-1.32 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.06.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.59.69.49A10.02 10.02 0 0 0 22 12.25C22 6.58 17.52 2 12 2z" />
    </svg>
  ) 
}

function LinkedinIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zM8.34 18.34V9.99H5.67v8.35h2.67zM7 8.67a1.55 1.55 0 1 0 0-3.1 1.55 1.55 0 0 0 0 3.1zm11.34 9.67v-4.58c0-2.45-1.31-3.59-3.06-3.59-1.41 0-2.04.78-2.39 1.32v-1.13h-2.67c.04.75 0 8.35 0 8.35h2.67v-4.66c0-.24.02-.48.09-.65.19-.48.63-.97 1.36-.97.96 0 1.34.73 1.34 1.8v4.48h2.65z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

const socials = [
  { label: 'GitHub', icon: <GithubIcon />, href: 'https://github.com/joshuacortes195' },
  { label: 'LinkedIn', icon: <LinkedinIcon />, href: 'https://www.linkedin.com/in/joshua-cortes157' },
  { label: 'Instagram', icon: <InstagramIcon />, href: 'https://www.instagram.com/josh_cort__/' },
]

export default function Contact() {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [copied, setCopied] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('sending')

    const form = e.currentTarget
    const formData = new FormData(form)
    formData.append('access_key', ACCESS_KEY)

    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (data.success) {
        setStatus('sent')
        form.reset()
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(EMAIL)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section id="contact" className="py-24">
      <div className="mx-auto max-w-2xl px-8">
        <h2 className="text-center text-4xl font-extrabold tracking-tight sm:text-5xl">
          Let's Work Together
        </h2>
        <p className="mt-3 text-center text-neutral-500">
          Have a project in mind? Send me a message below
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-12 rounded-xl border border-neutral-200 bg-white p-8 shadow-sm"
        >
          <label className="block text-sm font-bold">Name</label>
          <input
            name="name"
            required
            placeholder="Your name"
            className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-900"
          />

          <label className="mt-6 block text-sm font-bold">Email</label>
          <input
            name="email"
            type="email"
            required
            placeholder="your.email@example.com"
            className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-900"
          />

          <label className="mt-6 block text-sm font-bold">Message</label>
          <textarea
            name="message"
            required
            rows={5}
            placeholder="Your message..."
            className="mt-2 w-full rounded-lg border border-neutral-300 px-4 py-3 text-sm outline-none focus:border-neutral-900"
          />

          <button
            type="submit"
            disabled={status === 'sending'}
            className="mt-6 w-full rounded-lg bg-neutral-900 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:opacity-60"
          >
            {status === 'sending' ? 'Sending...' : 'Send Message'}
          </button>

          {status === 'sent' && (
            <p className="mt-4 text-center text-sm font-medium text-green-600">
              Thanks! Your message has been sent.
            </p>
          )}
          {status === 'error' && (
            <p className="mt-4 text-center text-sm font-medium text-red-600">
              Something went wrong. Please try again or email me directly.
            </p>
          )}
        </form>

        <p className="mt-12 text-center text-sm text-neutral-500">Or connect with me on:</p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <button
            onClick={copyEmail}
            className="flex flex-col items-center gap-2 rounded-lg border border-neutral-200 bg-white py-5 text-sm font-semibold shadow-sm transition-shadow hover:shadow-md"
          >
            <Mail className="h-5 w-5" />
            {copied ? 'Copied!' : 'Email'}
          </button>

          {socials.map(({ label, icon, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 rounded-lg border border-neutral-200 bg-white py-5 text-sm font-semibold shadow-sm transition-shadow hover:shadow-md"
            >
              {icon}
              {label}
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}