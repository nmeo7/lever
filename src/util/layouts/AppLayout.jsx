import { Outlet } from 'react-router-dom'

const AppLayout = () => (
  <div
    className="flex flex-col h-screen overflow-hidden bg-white text-black"
    style={{ fontFamily: "'Ubuntu', sans-serif" }}
  >
    <main className="flex-1 overflow-y-auto">
      <Outlet />
    </main>
  </div>
)

export default AppLayout
