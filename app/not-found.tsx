import Link from "next/link";

export const runtime = "edge";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-900">
      <h1 className="text-4xl font-extrabold mb-2">404 - Page Not Found</h1>
      <p className="text-slate-600 mb-6">The review or dashboard page you requested does not exist.</p>
      <Link href="/" className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition">
        Return Home
      </Link>
    </div>
  );
}
