import { InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-[#E5E5E5]">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'flex h-12 w-full rounded-lg border border-[#2C2C2C] bg-[#1F1F1F] px-4 py-3 text-[#E5E5E5] placeholder:text-[#A3A3A3] focus:border-[#FF6B35] focus:outline-none focus:ring-2 focus:ring-[#FF6B35]/20 disabled:cursor-not-allowed disabled:opacity-50',
            error && 'border-[#FF3D00] focus:border-[#FF3D00] focus:ring-[#FF3D00]/20',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-[#FF3D00]">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }