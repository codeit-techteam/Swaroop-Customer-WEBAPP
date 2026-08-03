import { Skeleton } from "@/components/ui/skeleton";

export default function AuthLoading() {
  return (
    <div className="flex min-h-screen">
      <div className="hidden w-[55%] bg-brand lg:block" />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="mt-4 h-11 w-full max-w-sm" />
        <Skeleton className="h-11 w-full max-w-sm" />
        <Skeleton className="h-11 w-full max-w-sm" />
      </div>
    </div>
  );
}
