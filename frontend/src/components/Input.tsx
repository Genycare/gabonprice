import { forwardRef, type InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, id, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-ink">
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={`min-h-11 rounded-card border border-line bg-white px-3.5 py-2.5 text-base text-ink placeholder:text-muted focus-visible:border-brand-green ${className}`}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {error && <span className="text-sm text-red-600">{error}</span>}
      </div>
    )
  },
)

Input.displayName = 'Input'
