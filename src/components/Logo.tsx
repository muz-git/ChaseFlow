interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  lightText?: boolean
}

export function Logo({ size = 'md', lightText = false }: LogoProps) {
  const dimensions = {
    sm: { box: 'h-8 w-8', text: 'text-lg' },
    md: { box: 'h-10 w-10', text: 'text-xl' },
    lg: { box: 'h-12 w-12', text: 'text-2xl' },
  }[size]

  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <div
        className={`${dimensions.box} relative shrink-0 overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-slate-900/10`}
      >
        <img
          src="/logo-collie.png"
          alt="FetchDocs mascot"
          className="h-full w-full object-cover"
        />
      </div>
      <span
        className={`${dimensions.text} font-bold tracking-tight ${
          lightText ? 'text-white' : 'text-slate-900'
        }`}
      >
        Fetch<span className="text-emerald-600">Docs</span>
      </span>
    </div>
  )
}