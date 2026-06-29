'use server';

import { createClient } from '@/lib/supabase/server';
import { BaseResponse, User } from '@/lib/types';

/**
 * 获取当前登录用户信息
 */
export async function getCurrentUser(): Promise<BaseResponse<User>> {
  try {
    const supabase = await createClient();
    
    // 获取当前 Auth 用户
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return { code: 401, data: null, message: '未登录' };
    }

    // 获取业务用户表信息
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (dbError || !dbUser) {
      return { code: 404, data: null, message: '找不到用户资料' };
    }

    return { code: 0, data: dbUser as User, message: '获取成功' };
  } catch (error: any) {
    return { code: 500, data: null, message: error.message || '内部服务器错误' };
  }
}
