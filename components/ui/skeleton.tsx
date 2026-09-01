import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("pl-skeleton rounded-md", className)} {...props} />;
}

export { Skeleton };
