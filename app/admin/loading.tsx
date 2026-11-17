export default function AdminLoading() {
  return (
    <div
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-8 animate-pulse"
      aria-busy="true"
      aria-label="Loading admin workspace"
    >
      <div className="space-y-3 border-b border-[#303A44] pb-6">
        <div className="h-3.5 w-32 rounded bg-[#202831]" />
        <div className="h-8 w-64 rounded-lg bg-[#202831]" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((stat) => (
          <div
            key={stat}
            className="h-24 rounded-xl border border-[#303A44] bg-[#171D23] p-5 space-y-2"
          >
            <div className="h-3.5 w-28 rounded bg-[#202831]" />
            <div className="h-6 w-14 rounded bg-[#202831]" />
          </div>
        ))}
      </div>

      <div className="h-80 rounded-xl border border-[#303A44] bg-[#171D23] p-6 space-y-4">
        <div className="h-5 w-48 rounded bg-[#202831]" />
        <div className="h-12 rounded-lg bg-[#101418]" />
        <div className="h-12 rounded-lg bg-[#101418]" />
        <div className="h-12 rounded-lg bg-[#101418]" />
      </div>
    </div>
  );
}
