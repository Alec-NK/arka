import * as React from "react"
import { cn } from "@/utils/cn"

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "field-control",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
