import React from 'react'
import cn from 'classnames'
import './Input.module.css'

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: string
  helpText?: string
  size?: 'sm' | 'md' | 'lg'
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, size = 'md', className, ...props }, ref) => {
    return (
      <div className="input-group">
        {label && (
          <label htmlFor={props.id} className="input-label">
            {label}
            {props.required && <span className="input-required">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={cn('input', `input-${size}`, { 'input-error': error }, className)}
          {...props}
        />
        {error && <p className="input-error-message">{error}</p>}
        {helpText && !error && <p className="input-help-text">{helpText}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
