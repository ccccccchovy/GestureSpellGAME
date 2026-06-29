import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { getGlobalRecentHighScores } from '@/services/score.actions';

export const dynamic = 'force-dynamic';

export default async function RankingsPage() {
  // 调用真实的后端接口获取最近高分记录
  const res = await getGlobalRecentHighScores(20);
  const scores = res.data || [];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 p-8 max-w-4xl mx-auto w-full relative z-10">
        <h1 className="font-press-start text-3xl text-arcade-yellow mb-12 text-center">GLOBAL RANKINGS</h1>

        <div className="bg-arcade-black border-[4px] border-arcade-white p-1">
          {/* Table Header */}
          <div className="grid grid-cols-4 bg-arcade-white text-arcade-black font-press-start text-sm py-2 px-4">
            <div>RANK</div>
            <div className="col-span-2">PLAYER</div>
            <div className="text-right">SCORE</div>
          </div>

          {/* Table Body (Dynamic Data) */}
          <div className="divide-y-[2px] divide-arcade-gray font-dot-gothic text-lg">
            
            {scores.length === 0 ? (
              <div className="py-8 text-center text-arcade-pixel-gray font-press-start text-sm">
                NO RECORDS FOUND
              </div>
            ) : (
              scores.map((scoreRecord, index) => {
                const rank = index + 1;
                let rowClasses = "grid grid-cols-4 py-4 px-4 text-arcade-white";
                let rankClasses = "font-press-start text-xs";
                let scoreClasses = "text-right font-press-start text-xs";

                if (rank === 1) {
                  rowClasses = "grid grid-cols-4 py-4 px-4 bg-arcade-gray/30 text-arcade-yellow animate-pulse";
                  rankClasses = "font-press-start";
                  scoreClasses = "text-right font-press-start";
                } else if (rank === 2) {
                  rowClasses = "grid grid-cols-4 py-4 px-4 text-arcade-green";
                  rankClasses = "font-press-start text-sm";
                  scoreClasses = "text-right font-press-start text-sm";
                } else if (rank === 3) {
                  rowClasses = "grid grid-cols-4 py-4 px-4 text-arcade-pixel-gray";
                  rankClasses = "font-press-start text-sm";
                  scoreClasses = "text-right font-press-start text-sm";
                }

                return (
                  <div key={scoreRecord.id} className={rowClasses}>
                    <div className={rankClasses}>
                      {rank === 1 ? '1ST' : rank === 2 ? '2ND' : rank === 3 ? '3RD' : `${rank}TH`}
                    </div>
                    <div className="col-span-2">
                      {scoreRecord.user?.username || 'UNKNOWN'}
                      <span className="text-xs text-arcade-pixel-gray ml-2">[{scoreRecord.game?.title}]</span>
                    </div>
                    <div className={scoreClasses}>{scoreRecord.score}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}