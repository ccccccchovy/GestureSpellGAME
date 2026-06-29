import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "primary" | "secondary" | "danger"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap px-6 py-3 font-press-start text-sm uppercase transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 active:translate-x-[4px] active:translate-y-[4px] active:shadow-none",
          {
            "bg-arcade-green text-arcade-black pixel-border-green pixel-shadow hover:bg-[#7AE08B]": variant === "primary",
            "bg-arcade-gray text-arcade-white pixel-border pixel-shadow hover:bg-[#3B4C96]": variant === "secondary",
            "bg-arcade-red text-arcade-white pixel-border-red pixel-shadow hover:bg-[#F05A63] hover:animate-blink": variant === "danger",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }