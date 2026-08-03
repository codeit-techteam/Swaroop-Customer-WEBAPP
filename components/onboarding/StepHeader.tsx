import { cn } from "@/lib/utils";

interface StepHeaderProps {
  stepLabel?: string;
  title: string;
  description?: string;
  illustration?: React.ReactNode;
  className?: string;
}

export function StepHeader({
  stepLabel,
  title,
  description,
  illustration,
  className,
}: StepHeaderProps) {
  return (
    <header
      className={cn(
        "mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        {stepLabel ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-sky-600">
            {stepLabel}
          </p>
        ) : null}
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {illustration ? (
        <div className="hidden shrink-0 sm:block" aria-hidden="true">
          {illustration}
        </div>
      ) : null}
    </header>
  );
}
