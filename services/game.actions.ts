'use server';

import { createClient } from '@/lib/supabase/server';
import { BaseResponse, Game } from '@/lib/types';
import { getCurrentUser } from './auth.actions';

/**
 * 获取所有已上线的游戏列表 (前端门户展示)
 */
export async function getPublishedGames(): Promise<BaseResponse<Game[]>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('status', 'ONLINE')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return { code: 0, data: data as Game[], message: '获取成功' };
  } catch (error: any) {
    return { code: 500, data: null, message: error.message || '服务器错误' };
  }
}

/**
 * 根据 slug 获取游戏详情
 */
export async function getGameBySlug(slug: string): Promise<BaseResponse<Game>> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { code: 404, data: null, message: '游戏不存在' };
      }
      throw error;
    }
    
    return { code: 0, data: data as Game, message: '获取成功' };
  } catch (error: any) {
    return { code: 500, data: null, message: error.message || '服务器错误' };
  }
}

/**
 * [Admin] 获取所有游戏列表 (包含未上线)
 */
export async function adminGetAllGames(): Promise<BaseResponse<Game[]>> {
  try {
    // 权限校验
    const userRes = await getCurrentUser();
    if (userRes.code !== 0 || userRes.data?.role !== 'admin') {
      return { code: 403, data: null, message: '无权访问' };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('games')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return { code: 0, data: data as Game[], message: '获取成功' };
  } catch (error: any) {
    return { code: 500, data: null, message: error.message || '服务器错误' };
  }
}

/**
 * [Admin] 新增或更新游戏
 */
export async function adminUpsertGame(gamePayload: Partial<Game>): Promise<BaseResponse<Game>> {
  try {
    const userRes = await getCurrentUser();
    if (userRes.code !== 0 || userRes.data?.role !== 'admin') {
      return { code: 403, data: null, message: '无权访问' };
    }

    if (!gamePayload.slug || !gamePayload.title || !gamePayload.entry_url) {
      return { code: 400, data: null, message: '缺少必填字段(slug, title, entry_url)' };
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('games')
      .upsert({
        id: gamePayload.id, // 有 id 则是更新，没有则是插入
        slug: gamePayload.slug,
        title: gamePayload.title,
        description: gamePayload.description,
        cover_url: gamePayload.cover_url,
        entry_url: gamePayload.entry_url,
        status: gamePayload.status || 'DEV'
      })
      .select()
      .single();

    if (error) throw error;

    return { code: 0, data: data as Game, message: '操作成功' };
  } catch (error: any) {
    return { code: 500, data: null, message: error.message || '服务器错误' };
  }
}

/**
 * [Admin] 修改游戏状态
 */
export async function adminChangeGameStatus(gameId: string, status: 'ONLINE' | 'OFFLINE' | 'DEV'): Promise<BaseResponse<null>> {
   try {
    const userRes = await getCurrentUser();
    if (userRes.code !== 0 || userRes.data?.role !== 'admin') {
      return { code: 403, data: null, message: '无权访问' };
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('games')
      .update({ status })
      .eq('id', gameId);

    if (error) throw error;

    return { code: 0, data: null, message: '状态修改成功' };
  } catch (error: any) {
    return { code: 500, data: null, message: error.message || '服务器错误' };
  }
}
