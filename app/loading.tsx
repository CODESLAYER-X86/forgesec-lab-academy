export default function RootLoading() {
  return (
    <div
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-10 animate-pulse"
      aria-busy="true"
      aria-label="Loading page"
    >
      <div className="space-y-4">
        <div className="h-4 w-44 rounded bg-[#202831]" />
        <div className="h-10 w-3/4 max-w-2xl rounded-lg bg-[#202831]" />
        <div className="h-5 w-full max-w-xl rounded bg-[#171D23]" />
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="h-52 rounded-xl border border-[#303A44] bg-[#171D23] p-6 space-y-4"
          >
            <div className="h-3.5 w-24 rounded bg-[#202831]" />
            <div className="h-6 w-3/4 rounded bg-[#202831]" />
            <div className="h-4 w-full rounded bg-[#101418]" />
            <div className="h-4 w-2/3 rounded bg-[#101418]" />
          </div>
        ))}
      </div>
    </div>
  );
}
