const classes = {
  "brand": "flex items-center gap-3.5 text-[28px] font-semibold tracking-[-0.6px] text-brand"
} as const;

export function Brand({ className = '' }: { className?: string }) {
  return <div className={`${classes.brand} ${className}`}><svg viewBox="0 0 32 34" width="30" height="32" aria-hidden="true"><path d="M5 29V15C5 8 9.5 4 16 4S27 8 27 15V29" fill="none" stroke="currentColor" strokeWidth="7" /></svg><span>Arka</span></div>;
}
