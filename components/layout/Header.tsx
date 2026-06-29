'use client';

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  return (
    <header className="border-b-[4px] border-arcade-pixel-gray p-4 flex flex-col md:flex-row justify-between items-center bg-arcade-gray z-10 relative pixel-shadow-yellow mb-4">
      <Link href="/" className="font-press-start text-arcade-yellow text-xl mb-4 md:mb-0 hover:animate-blink drop-shadow-md">
        GESTURE SPELL
      </Link>
      <nav className="flex gap-4 items-center">
        <Button asChild variant="secondary" className="px-4 py-2">
          <Link href="/">首页</Link>
        </Button>
        <Button asChild variant="secondary" className="px-4 py-2">
          <Link href="/games">大厅</Link>
        </Button>
        <Button asChild variant="secondary" className="px-4 py-2">
          <Link href="/rankings">排行榜</Link>
        </Button>
        
        {user ? (
           <Button variant="danger" className="px-4 py-2" onClick={handleLogout}>
             退出
           </Button>
        ) : (
          <Button asChild className="px-4 py-2">
            <Link href="/login">登录</Link>
          </Button>
        )}
      </nav>
    </header>
  );
}
