export default function AdminDashboard() {
  return (
    <div>
      <h1 className="font-press-start text-xl text-arcade-white mb-8">SYSTEM_OVERVIEW</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="border-[2px] border-arcade-green p-4 bg-arcade-gray">
          <div className="text-arcade-pixel-gray text-sm mb-2">TOTAL_GAMES</div>
          <div className="font-press-start text-2xl text-arcade-yellow">02</div>
        </div>
        <div className="border-[2px] border-arcade-green p-4 bg-arcade-gray">
          <div className="text-arcade-pixel-gray text-sm mb-2">REGISTERED_USERS</div>
          <div className="font-press-start text-2xl text-arcade-white">1,024</div>
        </div>
        <div className="border-[2px] border-arcade-green p-4 bg-arcade-gray">
          <div className="text-arcade-pixel-gray text-sm mb-2">SYSTEM_STATUS</div>
          <div className="font-press-start text-2xl text-arcade-green animate-pulse">ONLINE</div>
        </div>
      </div>

      <div className="border-[2px] border-arcade-green p-4">
        <h2 className="font-press-start text-sm text-arcade-white mb-4">RECENT_LOGS</h2>
        <div className="space-y-2 text-sm opacity-80">
          <p>[2026-06-29 02:00:00] Admin login successful from 192.168.1.1</p>
          <p>[2026-06-28 15:30:22] Game "ninja-slice" status updated to ONLINE</p>
          <p>[2026-06-28 10:15:05] System initialized.</p>
        </div>
      </div>
    </div>
  );
}