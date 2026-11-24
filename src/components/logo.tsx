interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  lightText?: boolean
}

export function Logo({ size = 'md', lightText = false }: LogoProps) {
  const dimensions = {
    sm: { box: 'h-7 w-7', icon: 'h-4 w-4', text: 'text-lg' },
    md: { box: 'h-9 w-9', icon: 'h-5 w-5', text: 'text-xl' },
    lg: { box: 'h-11 w-11', icon: 'h-6 w-6', text: 'text-2xl' },
  }[size]

  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <div
        className={`${dimensions.box} flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-700 shadow-sm ring-1 ring-slate-900/10`}
      >
        <svg
          className={`${dimensions.icon} text-white`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          {/* Document outline */}
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          {/* Checkmark flow */}
          <path d="m9 14.5 2 2 4-4" className="text-emerald-400" stroke="currentColor" />
        </svg>
      </div>
      <span
        className={`${dimensions.text} font-bold tracking-tight ${
          lightText ? 'text-white' : 'text-slate-900'
        }`}
      >
        Chase<span className="text-emerald-600">Flow</span>
      </span>
    </div>
  )
}