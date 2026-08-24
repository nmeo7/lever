import { Outlet } from 'react-router-dom'

const AppLayout = () => (
  <div
    className="flex flex-col h-screen overflow-hidden"
    style={{
      fontFamily: "'Ubuntu', sans-serif",
      background: 'var(--neu-bg)',
      color: 'var(--color-text)',
    }}
  >
    <main className="flex-1 overflow-y-auto">
      <Outlet />
    </main>
  </div>
)

export default AppLayout
