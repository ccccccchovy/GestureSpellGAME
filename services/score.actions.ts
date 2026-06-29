'use server';

import { createClient } from '@/lib/supabase/server';
import { BaseResponse, Score } from '@/lib/types';
import { getCurrentUser } from './auth.actions';

/**
 * 提交游戏分数
 * @param gameId 游戏唯一 ID
 * @param score 最终得分
 */
export async function submitScore(gameId: string, score: number): Promise<BaseResponse<null>> {
  try {
    const userRes = await getCurrentUser();
    if (userRes.code !== 0 || !userRes.data) {
      return { code: 401, data: null, message: '请先登录' };
    }

    if (!gameId || typeof score !== 'number') {
      return { code: 400, data: null, message: '参数错误(缺少 gameId 或 score 非数字)' };
    }

    const supabase = await createClient();
    console.log(`[Score Submit] User: ${userRes.data.id}, Game: ${gameId}, Score: ${score}`);
    
    const { error } = await supabase
      .from('scores')
      .insert({
        user_id: userRes.data.id,
        game_id: gameId,
        score: score
      });

    if (error) {
      console.error('[Score Submit] Supabase Error:', error);
      throw error;
    }

    return { code: 0, data: null, message: '分数提交成功' };
  } catch (error: any) {
    return { code: 500, data: null, message: error.message || '服务器错误' };
  }
}

/**
 * 获取指定游戏排行榜 (Top 100)
 * @param gameId 游戏唯一 ID
 */
export async function getGameLeaderboard(gameId: string): Promise<BaseResponse<Score[]>> {
  try {
    const supabase = await createClient();
    
    // 使用外键关联查询用户表的部分信息
    const { data, error } = await supabase
      .from('scores')
      .select(`
        id,
        score,
        recorded_at,
        user:users ( username, avatar_url )
      `)
      .eq('game_id', gameId)
      .order('score', { ascending: false })
      .limit(100);

    if (error) throw error;

    return { code: 0, data: data as unknown as Score[], message: '获取成功' };
  } catch (error: any) {
    return { code: 500, data: null, message: error.message || '服务器错误' };
  }
}

/**
 * 获取全平台最近的高分记录 (展示在首页)
 */
export async function getGlobalRecentHighScores(limit: number = 10): Promise<BaseResponse<Score[]>> {
    try {
    const supabase = await createClient();
    
    const { data, error } = await supabase
      .from('scores')
      .select(`
        id,
        score,
        recorded_at,
        user:users ( username ),
        game:games ( title )
      `)
      .order('recorded_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return { code: 0, data: data as unknown as Score[], message: '获取成功' };
  } catch (error: any) {
    return { code: 500, data: null, message: error.message || '服务器错误' };
  }
}
