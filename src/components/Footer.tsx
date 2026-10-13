import { useRef, useState } from 'react'
import { site } from '../data/site'
import { safeLink, sitePath } from '../lib/links'
import { scrollToSection } from '../lib/scroll'

const ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_KEY

// the least an email has to look like: something@something.something
const EMAIL_SHAPE = /^\S+@\S+\.\S+$/

// profile links, shown only when they are real https addresses
const github = safeLink(site.github)
const linkedin = safeLink(site.linkedin)
// the resume is a file on this site
const resume = sitePath(site.resume)

export default function Footer() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  // true while the email field holds something that isn't an email
  const [emailBad, setEmailBad] = useState(false)
  const emailField = useRef<HTMLInputElement>(null)

  // send button only works once every field has something in it
  const canSubmit = name.trim() !== '' && email.trim() !== '' && message.trim() !== '' && status !== 'sending'

  // sends the message through web3forms
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // a bad email never gets sent, the field is marked and takes focus instead
    if (!EMAIL_SHAPE.test(email.trim())) {
      setEmailBad(true)
      emailField.current?.focus()
      return
    }
    if (!ACCESS_KEY) { setStatus('error'); return }
    // the hidden box only bots tick
    const botcheck = (e.currentTarget as HTMLFormElement).querySelector<HTMLInputElement>('input[name="botcheck"]')
    setStatus('sending')
    const fd = new FormData()
    fd.append('name', name)
    fd.append('email', email.trim())
    fd.append('message', message)
    fd.append('access_key', ACCESS_KEY)
    // a ticked trap box goes along like a normal form would send it, so web3forms drops the message on its side
    if (botcheck?.checked) fd.append('botcheck', 'on')
    // fixed subject and sender name for the email that lands in my inbox
    fd.append('subject', 'New message from the portfolio contact form')
    fd.append('from_name', 'Portfolio contact form')
    try {
      const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.success) {
        setStatus('sent')
        setName(''); setEmail(''); setMessage('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <footer id="contact" className="px-4 md:px-8 py-20 md:py-28 border-t border-ink">
      <h2 data-reveal className="display section-title">
        {site.contact.title}
      </h2>

      <div className="mt-12 md:mt-16 grid gap-x-8 gap-y-12 md:grid-cols-12">
        {/* email and social links */}
        <div data-reveal className="md:col-span-5">
          <a href={`mailto:${site.email}`} className="link inline-block py-2.5 text-xl md:text-2xl font-semibold tracking-tight break-all">
            {site.email}
          </a>
          <ul className="mt-3 flex gap-6 text-lg">
            {github && (
              <li>
                <a href={github} target="_blank" rel="noopener noreferrer" className="link inline-block py-2">
                  GitHub
                </a>
              </li>
            )}
            {linkedin && (
              <li>
                <a href={linkedin} target="_blank" rel="noopener noreferrer" className="link inline-block py-2">
                  LinkedIn
                </a>
              </li>
            )}
            {resume && (
              <li>
                <a href={resume} target="_blank" rel="noopener noreferrer" className="link inline-block py-2">
                  Resume
                </a>
              </li>
            )}
          </ul>
        </div>

        {/* contact form */}
        <form data-reveal onSubmit={handleSubmit} className="md:col-span-6 md:col-start-7 space-y-6" noValidate>
          {/* hidden trap field for spam bots */}
          <input
            type="checkbox"
            name="botcheck"
            tabIndex={-1}
            aria-hidden="true"
            style={{ position: 'absolute', left: '-9999px', width: '1px', height: '1px' }}
          />

          <div>
            <label htmlFor="contact-name" className="meta block">
              Name
            </label>
            <input
              id="contact-name"
              className="field"
              value={name}
              onChange={e => setName(e.target.value)}
              autoComplete="name"
              required
            />
          </div>

          <div>
            <label htmlFor="contact-email" className="meta block">
              Email
            </label>
            <input
              ref={emailField}
              id="contact-email"
              className="field"
              type="email"
              value={email}
              onChange={e => {
                setEmail(e.target.value)
                // the warning goes away as soon as the email is fixed
                if (emailBad && EMAIL_SHAPE.test(e.target.value.trim())) setEmailBad(false)
              }}
              // checks the email when leaving the field, an empty one is left alone until sending
              onBlur={() => setEmailBad(email.trim() !== '' && !EMAIL_SHAPE.test(email.trim()))}
              autoComplete="email"
              required
              aria-invalid={emailBad}
              aria-describedby={emailBad ? 'contact-email-error' : undefined}
            />
            {/* what's wrong with the email, read out with the field */}
            {emailBad && (
              <p id="contact-email-error" className="field-error">
                <span aria-hidden="true">!</span>
                Enter a valid email, like name@company.com
              </p>
            )}
          </div>

          <div>
            <label htmlFor="contact-message" className="meta block">
              Message
            </label>
            <textarea
              id="contact-message"
              className="field resize-none"
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={!canSubmit}
              className="pill pill-accent disabled:bg-mute disabled:border-mute disabled:text-ink-soft disabled:cursor-not-allowed"
            >
              {status === 'sending' ? 'Sending…' : site.contact.sendButton}
            </button>
            {/* says why the button is gray while a field is still empty */}
            {!canSubmit && status !== 'sending' && <p className="meta mt-3 text-ink-soft">All three fields are needed.</p>}
          </div>

          {/* result of sending, with a small mono mark in front like the boot log */}
          {status === 'sent' && (
            <p role="status" className="form-note">
              <span aria-hidden="true">ok</span>
              {site.contact.sentMessage}
            </p>
          )}
          {status === 'error' && (
            <p role="alert" className="form-note">
              <span aria-hidden="true">!</span>
              Message didn't send. Try again or email me at{' '}
              <a href={`mailto:${site.email}`} className="link">
                {site.email}
              </a>
              .
            </p>
          )}
        </form>
      </div>

      {/* last line of the page, with a way back up */}
      <div className="mt-20 md:mt-28 pt-4 border-t border-ink flex items-center justify-between gap-4 meta text-ink-soft">
        <p>{site.name}</p>
        <a
          href="#top"
          onClick={e => {
            // scrolls back up smoothly and takes keyboard focus along
            e.preventDefault()
            scrollToSection('top')
          }}
          className="min-h-11 inline-flex items-center gap-[1ch] text-ink"
        >
          <span aria-hidden="true" className="text-ink-soft">
            &gt;
          </span>
          {/* only the words are underlined, not the arrow */}
          <span className="link">back to top</span>
        </a>
      </div>
    </footer>
  )
}
