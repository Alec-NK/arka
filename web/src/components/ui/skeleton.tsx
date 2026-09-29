import { cn } from "@/utils/cn"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("rounded bg-canvas", className)}
      {...props}
    />
  )
}

export { Skeleton }
