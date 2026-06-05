interface ToggleProps {
  checked: boolean
  disabled?: boolean
  onChange: (v: boolean) => void
  activeColor?: string
}

export function Toggle({ checked, disabled = false, onChange, activeColor }: ToggleProps) {
  const bg = checked ? (activeColor || 'var(--accent)') : 'var(--border)'
  
  return (
    <button
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      style={{ backgroundColor: bg }}
      className={[
        'relative shrink-0 w-[38px] h-[20px] rounded-full outline-none transition-all duration-200 ease-in-out',
        disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer hover:brightness-110 active:scale-95',
      ].join(' ')}
    >
      <span
        className={[
          'absolute top-[2px] left-[2px] w-[16px] h-[16px] rounded-full bg-white transition-all duration-200 ease-in-out shadow-[0_1px_3px_rgba(0,0,0,0.3)]',
          checked ? 'translate-x-[18px]' : 'translate-x-0',
        ].join(' ')}
      />
    </button>
  )
}
