import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-canvas text-ink text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-card border border-hairline flex items-center justify-center shadow-card mb-4 text-2xl font-bold font-display text-primary">
        404
      </div>
      <h1 className="font-display font-medium text-3xl sm:text-4xl mb-2 text-ink">Page Not Found</h1>
      <p className="text-sm text-muted mb-6 max-w-sm">The business review page or dashboard resource you requested does not exist or has moved.</p>
      <Link href="/" className="press inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-on-primary rounded-xl text-sm font-semibold shadow-revasy transition">
        <ArrowLeft className="w-4 h-4" />
        <span>Return to revasy Home</span>
      </Link>
    </div>
  );
}
