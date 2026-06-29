-- AI 手部识别游戏平台 - 数据库初始化脚本
-- 请在 Supabase SQL Editor 中执行

-- 1. 扩展 (UUID 支持)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. 创建自定义类型
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE game_status AS ENUM ('ONLINE', 'OFFLINE', 'DEV');

-- 3. 创建 users 表 (业务用户表，关联 auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  role user_role DEFAULT 'user'::user_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 4. 创建 games 表 (游戏基础信息)
CREATE TABLE public.games (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  cover_url TEXT,
  entry_url TEXT NOT NULL,
  status game_status DEFAULT 'DEV'::game_status NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 5. 创建 scores 表 (分数排行榜)
CREATE TABLE public.scores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 为了排行榜查询性能，建立复合索引
CREATE INDEX idx_scores_game_score ON public.scores(game_id, score DESC);

-- 6. 创建 game_versions 表 (游戏版本历史)
CREATE TABLE public.game_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_id UUID NOT NULL REFERENCES public.games(id) ON DELETE CASCADE,
  version_string TEXT NOT NULL,
  entry_url TEXT NOT NULL,
  release_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 7. 触发器：当 Supabase auth.users 注册时，自动向 public.users 插入数据
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, role)
  VALUES (
    new.id,
    new.email,
    -- 默认生成一个随机昵称，如 Player_xxxx
    COALESCE(new.raw_user_meta_data->>'username', 'Player_' || substr(new.id::text, 1, 6)),
    'user'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 8. 配置 RLS (Row Level Security) 策略

-- 启用 RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_versions ENABLE ROW LEVEL SECURITY;

-- users 表策略
-- 所有人可读
CREATE POLICY "Users are viewable by everyone" ON public.users FOR SELECT USING (true);
-- 只能修改自己的资料
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- games 表策略
-- 所有人可读 ONLINE 状态的游戏
CREATE POLICY "Published games are viewable by everyone" ON public.games FOR SELECT USING (status = 'ONLINE');
-- 管理员可读所有游戏，可执行所有操作 (假设已在应用层控制，这里简单处理，实际生产建议建立更严密的 admin 判定)
CREATE POLICY "Admin has full access to games" ON public.games FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- scores 表策略
-- 所有人可读
CREATE POLICY "Scores are viewable by everyone" ON public.scores FOR SELECT USING (true);
-- 只有登录用户且 user_id 是自己才能插入
CREATE POLICY "Users can insert own scores" ON public.scores FOR INSERT WITH CHECK (auth.uid() = user_id);

-- game_versions 表策略
-- 管理员可读写
CREATE POLICY "Admin has full access to game_versions" ON public.game_versions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
