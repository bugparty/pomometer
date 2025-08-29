// API types for Next.js
export interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
  created_at?: string;
  updated_at?: string;
}

export interface Todo {
  id: string;
  user_id: string;
  text: string;
  completed: boolean;
  deleted: boolean;
  focus: boolean;
  created_date: string;
  updated_date?: string;
  google_task_list_id?: string;
  googleTaskListId?: string;
  google_task_id?: string;
  googleTaskId?: string;
  subItems: SubTodo[];
}

export interface SubTodo {
  id: string;
  todo_id: string;
  text: string;
  completed: boolean;
  deleted: boolean;
  focus: boolean;
  created_date: string;
  updated_date?: string;
  start_time?: string;
  end_time?: string;
  description?: string;
  startTime?: string;
  endTime?: string;
  google_task_id?: string;
  googleTaskId?: string;
}

export interface Operation {
  id?: number;
  user_id: string;
  operation_type: string;
  payload: string;
  timestamp: string;
}

export interface UserSettings {
  user_id?: string;
  pomodoro_duration: number;
  short_break_duration: number;
  long_break_duration: number;
  ticking_sound_enabled: boolean;
  rest_ticking_sound_enabled: boolean;
  language: string;
  updated_at?: string;
}

// API types
export interface GoogleUserInfo {
  sub: string;
  email: string;
  name: string;
  picture: string;
  aud?: string | string[];
  iss?: string;
  exp?: number;
  iat?: number;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
    picture: string;
  };
  error?: string;
  googleAccessToken?: string;
}

export interface TodosResponse {
  success: boolean;
  data?: {
    todos: Todo[];
    lastSyncTime: string;
  };
  error?: string;
}

export interface SyncOperation {
  type: string;
  payload: unknown;
  timestamp: string;
}

// Payload type for Todo operations we persist as operation logs
export type OperationPayload = {
  id?: string;
  text?: string;
  completed?: boolean;
  checked?: boolean;
  focus?: boolean;
  createdDate?: string;
  parentId?: string;
  subId?: string;
  subText?: string;
  startTime?: string;
  endTime?: string;
  description?: string;
};

export interface SyncOperationsRequest {
  operations: SyncOperation[];
  lastSyncTime: string;
}

export interface SyncResponse {
  success: boolean;
  data?: {
    conflicts: unknown[];
    serverOperations: unknown[];
    lastSyncTime: string;
    settings?: UserSettings;
  };
  error?: string;
}

export interface SettingsResponse {
  success: boolean;
  data?: {
    settings: UserSettings;
    lastSyncTime: string;
  };
  error?: string;
}

// JWT types
export interface JWTHeader {
  alg: string;
  typ: string;
}

export interface JWTPayload {
  sub: string;
  email: string;
  name: string;
  picture: string;
  iat: number;
  exp: number;
}

// Environment variables interface
export interface Env {
  GOOGLE_CLIENT_ID: string;
  JWT_SECRET: string;
}
