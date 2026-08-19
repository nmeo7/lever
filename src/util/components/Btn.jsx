const variants = {
  primary: {
    background: 'var(--color-primary)',
    color: '#fff',
    border: 'none',
  },
  secondary: {
    background: 'var(--color-surface)',
    color: 'var(--color-text)',
    border: '1px solid var(--color-border)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-primary)',
    border: 'none',
  },
}

const Btn = ({ children, variant = 'primary', disabled, onClick, type = 'button', className = '' }) => (
  <button
    type={type}
    disabled={disabled}
    onClick={onClick}
    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50 ${className}`}
    style={variants[variant]}
  >
    {children}
  </button>
)

export default Btn
