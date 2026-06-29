'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { RetroInput } from '@/components/ui/RetroInput';

import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        }
      }
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-10">
      <Link href="/login" className="absolute top-8 left-8 text-arcade-green hover:animate-blink font-press-start">
        &lt; BACK
      </Link>
      
      <Card className="w-full max-w-md p-8 pixel-border">
        <div className="text-center mb-8">
          <h1 className="font-press-start text-2xl text-arcade-white mb-2">NEW PLAYER</h1>
          <p className="text-arcade-pixel-gray font-dot-gothic">CREATE YOUR PROFILE</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-2">
            <label className="block font-press-start text-xs text-arcade-green">USERNAME_</label>
            <RetroInput 
              type="text" 
              placeholder="PLAYER_ONE" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block font-press-start text-xs text-arcade-green">EMAIL_</label>
            <RetroInput 
              type="email" 
              placeholder="PLAYER@EXAMPLE.COM" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="block font-press-start text-xs text-arcade-green">PASSWORD_</label>
            <RetroInput 
              type="password" 
              placeholder="********" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-arcade-red text-sm animate-blink">{error}</p>}

          <Button type="submit" className="w-full mt-4" disabled={loading}>
            {loading ? 'INITIALIZING...' : 'CREATE ACCOUNT'}
          </Button>
        </form>

        <div className="mt-8 text-center text-sm text-arcade-pixel-gray">
          ALREADY REGISTERED? <Link href="/login" className="text-arcade-blue hover:underline">LOGIN HERE</Link>
        </div>
      </Card>
    </div>
  );
}