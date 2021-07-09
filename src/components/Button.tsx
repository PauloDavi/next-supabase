import { ReactNode } from 'react'

import classnames from 'classnames'

interface ButtonProps {
  children: ReactNode
  className?: string
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
}

export function Button({
  children,
  onClick,
  type = 'button',
  className,
}: ButtonProps) {
  return (
    <button
      type={type}
      className={classnames(
        className,
        'transform hover:scale-105 motion-reduce:transform-none transition duration-200 ease-in-out px-8 h-12 hover:bg-yellow-400 bg-yellow-300 gap-2 flex items-center justify-center rounded-lg text-white text-xl font-bold focus:outline-none focus:ring focus:ring-yellow-400 focus:ring-offset-2'
      )}
      onClick={onClick ?? undefined}
    >
      {children}
    </button>
  )
}
