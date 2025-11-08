import cx from 'classnames'

export default function Avatar({ src, alt, className }: { src?: string | null; alt?: string | null; className?: string }) {
  return (
    <img
      src={src || 'https://avatars.githubusercontent.com/u/9919?v=4'}
      alt={alt || 'Avatar'}
      className={cx('h-10 w-10 rounded-full object-cover ring-2 ring-white', className)}
    />
  )
}


