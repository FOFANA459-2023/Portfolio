import { useId, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import type { Errors, Field } from '@/lib/validate'
import { validateAll, validateField, limits } from '@/lib/validate'
import { sendContactMessage, isContactConfigured } from '@/lib/contact'
import { CheckIcon } from '@/components/ui/Icons'
import { cn } from '@/lib/cn'

type Status = 'idle' | 'submitting' | 'success' | 'error'

const EMPTY: Record<Field, string> = { name: '', email: '', message: '' }
const ORDER = ['name', 'email', 'message'] as const

export function ContactForm() {
  const id = useId()
  const [values, setValues] = useState<Record<Field, string>>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})
  const [status, setStatus] = useState<Status>('idle')
  const [serverError, setServerError] = useState<string | null>(null)
  const [botcheck, setBotcheck] = useState('')

  const setValue = (field: Field, value: string) => {
    setValues((v) => ({ ...v, [field]: value }))
    // Only re-validate live once a field has been visited, so nothing turns red
    // while someone is still mid-word on their first pass through it.
    if (touched[field]) {
      setErrors((e) => ({ ...e, [field]: validateField(field, value) }))
    }
  }

  const blur = (field: Field) => {
    setTouched((t) => ({ ...t, [field]: true }))
    setErrors((e) => ({ ...e, [field]: validateField(field, values[field]) }))
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setServerError(null)

    const nextErrors = validateAll(values)
    setErrors(nextErrors)
    setTouched({ name: true, email: true, message: true })

    if (Object.keys(nextErrors).length > 0) {
      // Send focus to the first problem rather than making them hunt for it.
      const first = ORDER.find((f) => nextErrors[f])
      if (first) document.getElementById(`${id}-${first}`)?.focus()
      return
    }

    setStatus('submitting')
    try {
      await sendContactMessage({ ...values, botcheck })
      setStatus('success')
      setValues(EMPTY)
      setTouched({})
    } catch (error) {
      setStatus('error')
      setServerError(error instanceof Error ? error.message : 'Something went wrong.')
    }
  }

  if (status === 'success') {
    return (
      <motion.div
        role="status"
        className="flex min-h-[22rem] flex-col items-start justify-center gap-4 rounded-2xl border border-line-soft bg-bg-2 p-8 sm:p-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full border border-accent/50 text-accent">
          <CheckIcon className="h-4 w-4" />
        </span>
        <h3 className="display-3">Message sent.</h3>
        <p className="prose-body max-w-[44ch] text-base">
          Thanks for writing. It lands in my inbox directly and I read everything that
          arrives there.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="link-underline mt-1 text-[0.9375rem] text-fg-soft"
        >
          Send another
        </button>
      </motion.div>
    )
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="relative rounded-2xl border border-line-soft bg-bg-2/80 p-6 shadow-[0_24px_50px_-32px_oklch(0.1_0.02_50_/_0.8)] sm:p-9"
    >
      {!isContactConfigured && (
        <p className="mb-8 rounded-lg border border-accent/40 bg-accent-soft px-4 py-3 text-[0.875rem] leading-relaxed text-accent">
          <strong className="font-medium">Setup needed:</strong> set{' '}
          <code>VITE_CONTACT_ENDPOINT</code> to a running instance of{' '}
          <code>server/</code>, or <code>VITE_WEB3FORMS_KEY</code> to a Web3Forms access
          key, before this form can deliver mail. See the README.
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          id={`${id}-name`}
          label="Name"
          value={values.name}
          error={touched.name ? errors.name : undefined}
          onChange={(v) => setValue('name', v)}
          onBlur={() => blur('name')}
          autoComplete="name"
          maxLength={limits.name.max}
        />
        <TextField
          id={`${id}-email`}
          label="Email"
          type="email"
          value={values.email}
          error={touched.email ? errors.email : undefined}
          onChange={(v) => setValue('email', v)}
          onBlur={() => blur('email')}
          autoComplete="email"
          maxLength={limits.email.max}
        />
      </div>

      <div className="mt-6">
        <TextField
          id={`${id}-message`}
          label="Message"
          multiline
          value={values.message}
          error={touched.message ? errors.message : undefined}
          onChange={(v) => setValue('message', v)}
          onBlur={() => blur('message')}
          maxLength={limits.message.max}
          hint={`${values.message.length} / ${limits.message.max}`}
        />
      </div>

      {/* Honeypot. Off-screen, hidden from assistive tech and skipped by the
          keyboard, so only something filling in every input reaches it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-[-9999px] h-px w-px overflow-hidden"
      >
        <label htmlFor={`${id}-botcheck`}>Leave this field empty</label>
        <input
          id={`${id}-botcheck`}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={botcheck}
          onChange={(e) => setBotcheck(e.target.value)}
        />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
        <button
          type="submit"
          disabled={status === 'submitting'}
          className={cn(
            'inline-flex min-w-[10rem] items-center justify-center gap-2.5 rounded-full',
            'border border-fg bg-fg px-7 py-3.5 text-[0.9375rem] text-bg',
            'transition-opacity duration-300 hover:opacity-85',
            'disabled:cursor-not-allowed disabled:opacity-60',
          )}
        >
          {status === 'submitting' ? (
            <>
              <span
                aria-hidden
                className="h-3.5 w-3.5 animate-spin rounded-full border border-current/30 border-t-current"
              />
              Sending
            </>
          ) : (
            'Send message'
          )}
        </button>
      </div>

      {/* role="alert" so a failure is announced, not merely coloured. */}
      <AnimatePresence>
        {status === 'error' && serverError && (
          <motion.p
            role="alert"
            className="mt-6 rounded-sm border border-accent/50 px-4 py-3 text-[0.875rem] text-accent"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {serverError}
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  )
}

/* -------------------------------------------------------------------------- */

interface TextFieldProps {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  onBlur: () => void
  error?: string
  type?: string
  multiline?: boolean
  autoComplete?: string
  maxLength?: number
  hint?: string
}

function TextField({
  id,
  label,
  value,
  onChange,
  onBlur,
  error,
  type = 'text',
  multiline,
  autoComplete,
  maxLength,
  hint,
}: TextFieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined

  const inputClass = cn(
    'w-full rounded-lg border bg-bg/40 px-4 py-3.5 text-[0.9375rem] text-fg',
    'transition-colors duration-300 placeholder:text-fg-faint',
    'focus:border-accent focus:outline-none',
    error ? 'border-accent' : 'border-line hover:border-fg-faint',
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    onChange(e.target.value)

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="label">
          {label}
        </label>
        {hint && (
          <span id={`${id}-hint`} className="text-[0.75rem] tabular-nums text-fg-faint">
            {hint}
          </span>
        )}
      </div>

      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          maxLength={maxLength}
          rows={6}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={cn(inputClass, 'min-h-[9rem] resize-y')}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={onBlur}
          maxLength={maxLength}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={inputClass}
        />
      )}

      <AnimatePresence>
        {error && (
          <motion.p
            id={`${id}-error`}
            className="mt-2 text-[0.8125rem] text-accent"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
