import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { getPublishedGames } from "@/services/game.actions";

export default async function GamesLobby() {
  const res = await getPublishedGames();
  const games = res.data || [];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 p-8 max-w-6xl mx-auto w-full relative z-10">
        <h2 className="font-press-start text-2xl md:text-3xl text-arcade-white mb-8">
          &gt; SELECT YOUR GAME
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {games.map(game => (
            <Card key={game.id} interactive className="flex flex-col">
              <div className="aspect-video bg-arcade-gray mb-4 pixel-border flex items-center justify-center relative overflow-hidden">
                 {game.cover_url && (
                    <img 
                      src={game.cover_url} 
                      alt={game.title}
                      className="absolute inset-0 w-full h-full object-cover opacity-50 mix-blend-overlay"
                    />
                 )}
                 <span className="font-press-start text-arcade-white z-10 text-xl">{game.title.substring(0, 5).toUpperCase()}</span>
              </div>
              <h3 className="text-xl text-arcade-green font-bold mb-2">{game.title}</h3>
              <div className="flex gap-2 mb-4">
                <span className="bg-arcade-green text-arcade-black px-2 py-1 text-xs pixel-border-green">需摄像头</span>
              </div>
              <p className="text-arcade-pixel-gray text-sm mb-6 flex-1">
                {game.description || '暂无描述'}
              </p>
              <Button asChild className="w-full">
                <Link href={`/play/${game.slug}`}>ENTER</Link>
              </Button>
            </Card>
          ))}

          {/* Game Card - DEV Placeholder */}
          <Card className="flex flex-col opacity-75">
            <div className="aspect-video bg-arcade-gray mb-4 pixel-border flex items-center justify-center">
               <span className="font-press-start text-arcade-pixel-gray text-lg">COMING SOON</span>
            </div>
            <h3 className="text-xl text-arcade-pixel-gray font-bold mb-2">太极推手</h3>
            <div className="flex gap-2 mb-4">
              <span className="bg-arcade-gray text-arcade-pixel-gray px-2 py-1 text-xs pixel-border border-arcade-pixel-gray">[DEV]</span>
            </div>
            <p className="text-arcade-pixel-gray text-sm mb-6 flex-1">
              敬请期待...
            </p>
            <Button disabled variant="secondary" className="w-full text-arcade-pixel-gray border-arcade-pixel-gray">
              DISABLED
            </Button>
          </Card>

        </div>
      </main>

      <Footer />
    </div>
  );
}
