import * as React from "react"
import { cn } from "@/lib/utils"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean
}

export function Card({ className, interactive = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-arcade-gray pixel-border p-4 pixel-shadow relative",
        interactive && "transition-all hover:-translate-y-1 hover:pixel-border-green hover:pixel-shadow-yellow",
        className
      )}
      {...props}
    >
      {/* Visual pixel corners using pseudo elements if needed, or rely on square borders */}
      {props.children}
    </div>
  )
}
