import * as React from "react"
import { cn } from "@/lib/utils"

export interface RetroInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
}

const RetroInput = React.forwardRef<HTMLInputElement, RetroInputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        className={cn(
          "flex w-full bg-arcade-black px-3 py-2 font-dot-gothic text-arcade-green placeholder:text-arcade-pixel-gray focus-visible:outline-none transition-colors",
          "border-[2px] border-arcade-white focus-visible:border-arcade-green focus-visible:shadow-[0_0_8px_var(--color-arcade-green)]",
          error && "border-arcade-red text-arcade-red focus-visible:border-arcade-red focus-visible:shadow-[0_0_8px_var(--color-arcade-red)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
RetroInput.displayName = "RetroInput"

export { RetroInput }