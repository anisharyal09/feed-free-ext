import { Toggle } from './Toggle'

interface RowProps {
  label: string
  hint?: string
  checked: boolean
  disabled?: boolean
  isLast?: boolean
  activeColor?: string
  onChange: (v: boolean) => void
}

export function Row({
  label,
  hint,
  checked,
  disabled = false,
  isLast = false,
  activeColor,
  onChange,
}: RowProps) {
  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      style={{ borderBottom: isLast ? 'none' : '1px solid var(--border)' }}
      className={[
        'flex items-center justify-between py-3 px-[10px] transition-all duration-150 select-none min-h-[58px]',
        disabled
          ? 'opacity-30 cursor-not-allowed'
          : 'cursor-pointer hover:bg-white/[0.03] active:bg-white/[0.01]',
      ].join(' ')}
    >
      <div className="flex flex-col gap-0.5 pr-4 min-w-0">
        <span
          className="text-[13px] font-semibold tracking-tight transition-colors duration-150"
          style={{ color: checked && !disabled ? 'var(--text)' : 'rgba(248, 250, 252, 0.85)' }}
        >
          {label}
        </span>
        {hint && (
          <span className="text-[11px] font-normal leading-normal" style={{ color: 'var(--muted)' }}>
            {hint}
          </span>
        )}
      </div>
      <div onClick={(e) => e.stopPropagation()} className="shrink-0 flex items-center">
        <Toggle checked={checked} disabled={disabled} onChange={onChange} activeColor={activeColor} />
      </div>
    </div>
  )
}
