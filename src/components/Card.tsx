import { PropsWithChildren } from 'react'
import cx from 'classnames'

export default function Card({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cx('card p-4', className)}>{children}</div>
}


