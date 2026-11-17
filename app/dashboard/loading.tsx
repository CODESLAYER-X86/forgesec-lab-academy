export default function DashboardLoading() {
  return (
    <div
      className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-8 animate-pulse"
      aria-busy="true"
      aria-label="Loading dashboard"
    >
      <div className="space-y-3 border-b border-[#303A44] pb-6">
        <div className="h-3.5 w-36 rounded bg-[#202831]" />
        <div className="h-8 w-72 rounded-lg bg-[#202831]" />
        <div className="h-4 w-96 max-w-full rounded bg-[#171D23]" />
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[1, 2, 3, 4].map((kpi) => (
          <div
            key={kpi}
            className="rounded-xl border border-[#303A44] bg-[#171D23] p-5 space-y-2.5"
          >
            <div className="h-3.5 w-24 rounded bg-[#202831]" />
            <div className="h-7 w-16 rounded bg-[#202831]" />
            <div className="h-3 w-28 rounded bg-[#101418]" />
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[1, 2].map((panel) => (
          <div
            key={panel}
            className="h-64 rounded-xl border border-[#303A44] bg-[#171D23] p-6 space-y-4"
          >
            <div className="h-5 w-44 rounded bg-[#202831]" />
            <div className="h-12 rounded-lg bg-[#101418]" />
            <div className="h-12 rounded-lg bg-[#101418]" />
            <div className="h-12 rounded-lg bg-[#101418]" />
          </div>
        ))}
      </div>
    </div>
  );
}
