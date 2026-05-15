import React from 'react'
import cn from 'classnames'
import './Card.module.css'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: string
  footer?: React.ReactNode
  elevation?: 'sm' | 'md' | 'lg'
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, title, subtitle, footer, elevation = 'md', className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('card', `card-${elevation}`, className)} {...props}>
        {(title || subtitle) && (
          <div className="card-header">
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
        )}

        <div className="card-body">{children}</div>

        {footer && <div className="card-footer">{footer}</div>}
      </div>
    )
  }
)

Card.displayName = 'Card'

export default Card
