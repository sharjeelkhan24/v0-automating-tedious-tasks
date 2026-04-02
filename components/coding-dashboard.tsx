export function CodingDashboard() {
  return (
    <div className="p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-100">Coding Assistant</h2>
          <p className="text-sm text-zinc-500 mt-0.5">Code generation and analysis tools</p>
        </div>
        <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500 border border-zinc-800 rounded px-2 py-1">
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
          No active session
        </span>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { title: "Code Generation", desc: "Generate boilerplate, functions, or full modules from a description.", action: "Open Generator" },
          { title: "Code Analysis", desc: "Analyse selected code for complexity, patterns, and potential issues.", action: "Analyse Code" },
          { title: "Refactor Assist", desc: "Get step-by-step guidance for refactoring a function or module.", action: "Start Refactor" },
        ].map(({ title, desc, action }) => (
          <div key={title} className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 flex flex-col gap-3">
            <h3 className="text-sm font-medium text-zinc-200">{title}</h3>
            <p className="text-xs text-zinc-500 leading-relaxed flex-1">{desc}</p>
            <button className="text-xs font-medium text-zinc-400 border border-zinc-700 rounded px-3 py-1.5 hover:bg-zinc-800 hover:text-zinc-200 transition-colors">
              {action}
            </button>
          </div>
        ))}
      </div>
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h3 className="text-sm font-medium text-zinc-200 mb-3">Code Input</h3>
        <textarea
          rows={8}
          placeholder="Paste code here or describe what you want to generate..."
          className="w-full rounded-md border border-zinc-700 bg-zinc-800 text-zinc-100 text-sm px-3 py-2 font-mono resize-none focus:outline-none focus:ring-1 focus:ring-zinc-500 placeholder:text-zinc-600 leading-relaxed"
        />
        <div className="flex items-center justify-between mt-3">
          <p className="text-xs text-zinc-600">Connect a screen or paste code to begin analysis</p>
          <button disabled className="text-xs font-medium bg-zinc-700 text-zinc-400 rounded px-3 py-1.5 cursor-not-allowed">
            Run Analysis
          </button>
        </div>
      </div>
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-4">
        <h3 className="text-sm font-medium text-zinc-200 mb-3">Recent Sessions</h3>
        <div className="flex items-center justify-center py-8 text-zinc-600 text-sm">
          No coding sessions yet. Start one above.
        </div>
      </div>
    </div>
  )
}
