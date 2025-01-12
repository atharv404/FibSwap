import { cn } from "@/lib/utils"

interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg'
}

export function Spinner({ className, size = 'md', ...props }: SpinnerProps) {
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-t-2 border-b-2 border-gray-900",
        {
          "w-4 h-4 border-2": size === 'sm',
          "w-8 h-8 border-4": size === 'md',
          "w-12 h-12 border-4": size === 'lg',
        },
        className
      )}
      {...props}
    />
  )
}

