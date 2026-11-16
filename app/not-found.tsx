import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <div className="text-xs font-mono uppercase tracking-wider text-[#A3E635]">
        404 · Not Found
      </div>
      <h1 className="mt-3 text-3xl font-bold tracking-tight text-[#F3F4F6]">
        Page not found
      </h1>
      <p className="mt-3 text-sm text-[#AAB4BE]">
        The requested lesson, path, or resource could not be located in FORGESEC ACADEMY.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          href="/"
          className="rounded-lg bg-[#A3E635] px-5 py-2.5 text-xs font-semibold text-[#101418] hover:bg-[#bef264] transition-colors"
        >
          Back to Home
        </Link>
        <Link
          href="/learn"
          className="rounded-lg border border-[#303A44] bg-[#171D23] px-5 py-2.5 text-xs font-medium text-[#F3F4F6] hover:bg-[#202831] transition-colors"
        >
          Browse Catalog
        </Link>
      </div>
    </div>
  );
}
