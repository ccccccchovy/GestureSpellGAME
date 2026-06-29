import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-arcade-black flex flex-col items-center justify-center p-4 relative z-10">
      <div className="border-[4px] border-arcade-red p-8 max-w-md w-full text-center bg-arcade-gray relative">
        {/* Decorative corner pieces */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-arcade-red"></div>
        <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-arcade-red"></div>
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-arcade-red"></div>
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-arcade-red"></div>

        <h1 className="font-press-start text-4xl text-arcade-red mb-4 animate-blink">404</h1>
        <h2 className="font-press-start text-xl text-arcade-white mb-6">FILE NOT FOUND</h2>
        
        <p className="font-dot-gothic text-arcade-pixel-gray mb-8">
          ERROR: The requested sector does not exist in the current memory bank.
        </p>

        <Button asChild variant="secondary" className="w-full">
          <Link href="/">RETURN TO BASE</Link>
        </Button>
      </div>
    </div>
  );
}