'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminUpsertGame } from '@/services/game.actions';
import { Button } from '@/components/ui/Button';

export default function NewGamePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const formData = new FormData(e.currentTarget);
    const payload = {
      title: formData.get('title') as string,
      slug: formData.get('slug') as string,
      entry_url: formData.get('entry_url') as string,
      cover_url: formData.get('cover_url') as string,
      description: formData.get('description') as string,
      status: formData.get('status') as 'DEV' | 'ONLINE' | 'OFFLINE',
    };

    const res = await adminUpsertGame(payload);
    if (res.code === 0) {
      router.push('/admin/games');
      router.refresh();
    } else {
      setErrorMsg(res.message);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="font-press-start text-xl text-arcade-white mb-8">ADD_NEW_GAME</h1>

      {errorMsg && (
        <div className="bg-red-900/50 border border-red-500 text-red-200 p-4 mb-6 font-press-start text-xs">
          [ERROR] {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-arcade-pixel-gray text-xs mb-2">GAME_TITLE *</label>
          <input 
            type="text" 
            name="title" 
            required
            className="w-full bg-arcade-gray border-[2px] border-arcade-green p-3 text-arcade-white font-press-start text-sm outline-none focus:border-arcade-white"
            placeholder="e.g. 魔法手印"
          />
        </div>

        <div>
          <label className="block text-arcade-pixel-gray text-xs mb-2">SLUG (URL Path) *</label>
          <input 
            type="text" 
            name="slug" 
            required
            className="w-full bg-arcade-gray border-[2px] border-arcade-green p-3 text-arcade-white font-press-start text-sm outline-none focus:border-arcade-white"
            placeholder="e.g. magic-signs"
          />
        </div>

        <div>
          <label className="block text-arcade-pixel-gray text-xs mb-2">ENTRY_URL (Iframe Src) *</label>
          <input 
            type="text" 
            name="entry_url" 
            required
            className="w-full bg-arcade-gray border-[2px] border-arcade-green p-3 text-arcade-white font-press-start text-sm outline-none focus:border-arcade-white"
            placeholder="e.g. /demo-game/index.html"
          />
        </div>

        <div>
          <label className="block text-arcade-pixel-gray text-xs mb-2">COVER_IMAGE_URL</label>
          <input 
            type="text" 
            name="cover_url" 
            className="w-full bg-arcade-gray border-[2px] border-arcade-green p-3 text-arcade-white font-press-start text-sm outline-none focus:border-arcade-white"
            placeholder="e.g. https://example.com/image.png"
          />
        </div>

        <div>
          <label className="block text-arcade-pixel-gray text-xs mb-2">DESCRIPTION</label>
          <textarea 
            name="description" 
            rows={3}
            className="w-full bg-arcade-gray border-[2px] border-arcade-green p-3 text-arcade-white text-sm outline-none focus:border-arcade-white font-sans"
            placeholder="Enter game description..."
          />
        </div>

        <div>
          <label className="block text-arcade-pixel-gray text-xs mb-2">STATUS</label>
          <select 
            name="status"
            className="w-full bg-arcade-gray border-[2px] border-arcade-green p-3 text-arcade-white font-press-start text-sm outline-none focus:border-arcade-white"
          >
            <option value="DEV">DEV (开发中)</option>
            <option value="ONLINE">ONLINE (已上线)</option>
            <option value="OFFLINE">OFFLINE (已下线)</option>
          </select>
        </div>

        <div className="pt-4 flex gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'SAVING...' : 'SAVE GAME'}
          </Button>
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            CANCEL
          </Button>
        </div>
      </form>
    </div>
  );
}