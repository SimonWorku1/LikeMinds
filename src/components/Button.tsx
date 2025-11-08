import { ButtonHTMLAttributes } from 'react'
import cx from 'classnames'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost'
}

export default function Button({ className, variant = 'primary', ...props }: Props) {
  return (
    <button
      {...props}
      className={cx(
        'btn',
        variant === 'primary' ? 'btn-primary' : 'btn-ghost',
        className
      )}
    />
  )
}


