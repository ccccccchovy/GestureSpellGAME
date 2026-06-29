export type UserRole = 'user' | 'admin';
export type GameStatus = 'ONLINE' | 'OFFLINE' | 'DEV';

export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

export interface Game {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  entry_url: string;
  status: GameStatus;
  created_at: string;
}

export interface Score {
  id: string;
  user_id: string;
  game_id: string;
  score: number;
  recorded_at: string;
  // 关联查询时的展开字段
  user?: Partial<User>;
  game?: Partial<Game>;
}

export interface GameVersion {
  id: string;
  game_id: string;
  version_string: string;
  entry_url: string;
  release_notes: string | null;
  created_at: string;
}

export interface BaseResponse<T = any> {
  code: number;
  data: T | null;
  message: string;
}
