import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-arcade-black text-arcade-green font-dot-gothic flex flex-col relative z-10">
      {/* Fake Terminal Header */}
      <header className="border-b-[2px] border-arcade-green p-2 flex justify-between items-center bg-arcade-gray">
        <span className="font-press-start text-xs">root@gesture-spell:~#</span>
        <div className="flex gap-4 text-xs font-press-start">
           <span className="animate-pulse">_</span>
           <Link href="/" className="hover:text-arcade-white">EXIT</Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r-[2px] border-arcade-green p-4 hidden md:block">
          <nav className="space-y-4 font-press-start text-sm">
            <Link href="/admin" className="block hover:text-arcade-white">&gt; DASHBOARD</Link>
            <Link href="/admin/games" className="block hover:text-arcade-white">&gt; GAMES_MGR</Link>
            <Link href="/admin/versions" className="block text-arcade-pixel-gray cursor-not-allowed">&gt; VERSIONS</Link>
            <Link href="/admin/users" className="block text-arcade-pixel-gray cursor-not-allowed">&gt; USERS</Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}