import Link from "next/link";
import { APP_SHORT_NAME, ROUTES } from "@/constants";
import { cn } from "@/lib/utils";

interface CustomerFooterProps {
  className?: string;
}

export function CustomerFooter({ className }: CustomerFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      className={cn(
        "mt-8 border-t border-slate-200 bg-white px-4 py-6 md:px-6",
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-brand">
            {APP_SHORT_NAME} Enterprise
          </p>
          <p className="mt-0.5 text-xs text-slate-400">
            © {year} PetroTrade Industrial Markets · India · GST Ready
          </p>
        </div>
        <nav
          aria-label="Footer"
          className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-slate-500"
        >
          <Link
            href={ROUTES.support}
            className="transition-colors hover:text-brand"
          >
            Help Center
          </Link>
          <Link
            href={ROUTES.documents}
            className="transition-colors hover:text-brand"
          >
            Documents
          </Link>
          <Link
            href={ROUTES.settings}
            className="transition-colors hover:text-brand"
          >
            Settings
          </Link>
        </nav>
      </div>
    </footer>
  );
}
