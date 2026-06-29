import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center p-8 relative z-10">
        
        <div className="text-center mb-16">
          <h1 className="font-press-start text-3xl md:text-5xl text-arcade-white mb-6 leading-tight">
            USE YOUR HANDS,<br />
            <span className="text-arcade-green animate-pulse">PLAY THE GAME</span>
          </h1>
          <p className="text-arcade-pixel-gray text-lg md:text-xl max-w-2xl mx-auto">
            纯浏览器端 AI 手势识别，无需任何额外设备。打开摄像头，即刻体验！
          </p>
        </div>

        <div className="mb-24">
          <Button asChild className="text-xl md:text-2xl px-8 py-6 animate-blink border-8">
            <Link href="/games">PRESS START</Link>
          </Button>
        </div>

        {/* Marquee */}
        <div className="w-full border-y-[4px] border-arcade-white py-4 overflow-hidden bg-arcade-gray flex relative">
          <div className="flex whitespace-nowrap animate-marquee gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <span key={i} className="font-press-start text-arcade-yellow text-xl">
                [ NEW GAME: NINJA SLICE ]
              </span>
            ))}
          </div>
          {/* Double the marquee content for seamless loop */}
          <div className="flex whitespace-nowrap animate-marquee gap-8 absolute top-4 left-full">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <span key={`dup-${i}`} className="font-press-start text-arcade-yellow text-xl">
                [ NEW GAME: NINJA SLICE ]
              </span>
            ))}
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
