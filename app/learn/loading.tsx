export default function LearnLoading() {
  return (
    <div
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10 animate-pulse"
      aria-busy="true"
      aria-label="Loading curriculum"
    >
      <div className="space-y-3 border-b border-[#303A44] pb-6">
        <div className="h-3.5 w-32 rounded bg-[#202831]" />
        <div className="h-9 w-80 max-w-full rounded-lg bg-[#202831]" />
        <div className="h-4 w-full max-w-2xl rounded bg-[#171D23]" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {[1, 2, 3, 4].map((card) => (
          <div
            key={card}
            className="rounded-xl border border-[#303A44] bg-[#171D23] p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-28 rounded bg-[#202831]" />
              <div className="h-3.5 w-20 rounded bg-[#202831]" />
            </div>
            <div className="h-6 w-2/3 rounded bg-[#202831]" />
            <div className="h-4 w-full rounded bg-[#101418]" />
            <div className="h-4 w-5/6 rounded bg-[#101418]" />
            <div className="h-2 w-full rounded-full bg-[#101418]" />
          </div>
        ))}
      </div>
    </div>
  );
}
