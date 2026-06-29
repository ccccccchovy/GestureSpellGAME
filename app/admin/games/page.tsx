import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { adminGetAllGames, adminChangeGameStatus } from "@/services/game.actions";
import { revalidatePath } from "next/cache";

export default async function AdminGames() {
  const res = await adminGetAllGames();
  const games = res.data || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-press-start text-xl text-arcade-white">GAMES_MANAGEMENT</h1>
        <Button asChild className="py-2 px-4 text-xs">
          <Link href="/admin/games/new">+ ADD NEW</Link>
        </Button>
      </div>
      
      {res.code === 403 && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 mb-4 font-press-start text-xs">
          [ERROR] 权限不足。您需要管理员(admin)权限才能查看和管理游戏。请在 Supabase 的 users 表中将您的角色修改为 admin。
        </div>
      )}

      <div className="border-[2px] border-arcade-green overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-[2px] border-arcade-green bg-arcade-gray font-press-start text-xs">
              <th className="p-4">NAME</th>
              <th className="p-4">SLUG</th>
              <th className="p-4">STATUS</th>
              <th className="p-4">CREATED</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {games.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-4 text-center text-arcade-pixel-gray">NO GAMES FOUND</td>
              </tr>
            ) : (
              games.map((game) => (
                <tr key={game.id} className="border-b-[1px] border-arcade-green/30 hover:bg-arcade-gray">
                  <td className="p-4">{game.title}</td>
                  <td className="p-4 text-arcade-pixel-gray">{game.slug}</td>
                  <td className="p-4">
                    {game.status === 'ONLINE' && <span className="text-arcade-green">[ONLINE]</span>}
                    {game.status === 'DEV' && <span className="text-arcade-yellow">[DEV]</span>}
                    {game.status === 'OFFLINE' && <span className="text-red-500">[OFFLINE]</span>}
                  </td>
                  <td className="p-4 text-arcade-pixel-gray">
                    {new Date(game.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}