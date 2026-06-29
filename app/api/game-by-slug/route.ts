import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ code: 400, message: 'Missing slug' });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('games')
    .select('id')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    return NextResponse.json({ code: 404, message: 'Game not found' });
  }

  return NextResponse.json({ code: 0, data: { id: data.id } });
}