export default function LessonReaderLoading() {
  return (
    <div
      className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 animate-pulse"
      aria-busy="true"
      aria-label="Loading lesson"
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_minmax(0,1fr)_220px]">
        <aside className="hidden lg:block">
          <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-4 space-y-3">
            <div className="h-3.5 w-36 rounded bg-[#202831]" />
            <div className="h-3 w-24 rounded bg-[#101418]" />
            <div className="pt-2 space-y-2">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div key={item} className="h-8 rounded-md bg-[#202831]" />
              ))}
            </div>
          </div>
        </aside>

        <div className="min-w-0 space-y-6">
          <div className="border-b border-[#303A44] pb-6 space-y-4">
            <div className="h-3.5 w-52 rounded bg-[#202831]" />
            <div className="h-9 w-4/5 rounded-lg bg-[#202831]" />
            <div className="h-4 w-full max-w-2xl rounded bg-[#171D23]" />
            <div className="flex gap-2 pt-2">
              {[1, 2, 3, 4].map((pill) => (
                <div key={pill} className="h-10 w-32 rounded-lg bg-[#171D23] border border-[#303A44]" />
              ))}
            </div>
          </div>

          <div className="space-y-4 max-w-[75ch]">
            <div className="h-6 w-64 rounded bg-[#202831]" />
            <div className="h-4 w-full rounded bg-[#171D23]" />
            <div className="h-4 w-11/12 rounded bg-[#171D23]" />
            <div className="h-4 w-5/6 rounded bg-[#171D23]" />
            <div className="h-36 w-full rounded-xl border border-[#303A44] bg-[#171D23]" />
            <div className="h-4 w-full rounded bg-[#171D23]" />
            <div className="h-4 w-4/5 rounded bg-[#171D23]" />
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="rounded-xl border border-[#303A44] bg-[#171D23] p-4 space-y-3">
            <div className="h-3.5 w-28 rounded bg-[#202831]" />
            <div className="h-3 w-36 rounded bg-[#101418]" />
            <div className="pt-2 space-y-2">
              {[1, 2, 3, 4, 5].map((toc) => (
                <div key={toc} className="h-3.5 w-full rounded bg-[#202831]" />
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
