// API сервис для взаимодействия с Django бэкендом

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

// Типы для API
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  password_confirm: string;
  name: string;
  gender: 'male' | 'female';
  age: number;
  height: number;
  weight: number;
  activity_level: 'low' | 'moderate' | 'high' | 'very_high';
  goal: 'lose' | 'maintain' | 'gain';
}

export interface User {
  id: number;
  email: string;
  name: string;
  gender: 'male' | 'female';
  age: number;
  height: number;
  weight: number;
  activity_level: 'low' | 'moderate' | 'high' | 'very_high';
  goal: 'lose' | 'maintain' | 'gain';
  nutrition_goals: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
}

export interface FoodItem {
  id: number;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  portion: number;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  created_at: string;
}

export interface DailyStats {
  date: string;
  total_calories: number;
  total_protein: number;
  total_fat: number;
  total_carbs: number;
  items: FoodItem[];
}

export interface PeriodStats {
  period: 'day' | 'week' | 'month';
  start_date: string;
  end_date: string;
  total_calories: number;
  total_protein: number;
  total_fat: number;
  total_carbs: number;
  average_calories: number;
  average_protein: number;
  average_fat: number;
  average_carbs: number;
  days_count: number;
  goals: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
  };
  comparison: {
    calories_percent: number;
    protein_percent: number;
    fat_percent: number;
    carbs_percent: number;
  };
}

export interface AuthResponse {
  user: User;
  refresh: string;
  access: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

// Хранение токенов
const getAccessToken = () => localStorage.getItem('access_token');
const getRefreshToken = () => localStorage.getItem('refresh_token');
const setTokens = (access: string, refresh: string) => {
  localStorage.setItem('access_token', access);
  localStorage.setItem('refresh_token', refresh);
};
const clearTokens = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

// Базовая функция для API запросов
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  
  // Добавляем токен авторизации
  const token = getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
    throw new Error(error.detail || error.message || 'Request failed');
  }
  
  // Если ответ пустой (DELETE запрос)
  if (response.status === 204) {
    return {} as T;
  }
  
  return response.json();
}

// Функция для обновления токена
async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    
    if (response.ok) {
      const data: TokenResponse = await response.json();
      localStorage.setItem('access_token', data.access);
      return data.access;
    }
  } catch {
    // Ignore error
  }
  
  return null;
}

// API методы
export const authApi = {
  // Регистрация (с сохранением токенов)
  register: async (data: RegisterData) => {
    const response = await apiRequest<AuthResponse>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    // Сохраняем токены после успешной регистрации
    setTokens(response.access, response.refresh);
    return response;
  },
  
  // Вход
  login: async (credentials: LoginCredentials) => {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      throw new Error('Invalid credentials');
    }
    
    const tokens: TokenResponse = await response.json();
    setTokens(tokens.access, tokens.refresh);
    
    // Получаем данные пользователя
    const user = await authApi.getProfile();
    return { user, ...tokens };
  },
  
  // Получить профиль
  getProfile: () => 
    apiRequest<User>('/auth/profile/'),
  
  // Обновить профиль
  updateProfile: (data: Partial<User>) => 
    apiRequest<User>('/auth/profile/update/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  // Выход
  logout: () => {
    clearTokens();
  },
  
  // Проверка авторизации
  isAuthenticated: () => !!getAccessToken(),
};

export const foodApi = {
  // Получить список записей
  getFoodItems: (params?: { date?: string; start_date?: string; end_date?: string; meal_type?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.date) queryParams.append('date', params.date);
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.meal_type) queryParams.append('meal_type', params.meal_type);
    
    const query = queryParams.toString();
    return apiRequest<FoodItem[]>(`/food/${query ? `?${query}` : ''}`);
  },
  
  // Создать запись
  createFoodItem: (data: Omit<FoodItem, 'id' | 'created_at'>) => 
    apiRequest<FoodItem>('/food/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  // Обновить запись
  updateFoodItem: (id: number, data: Partial<FoodItem>) => 
    apiRequest<FoodItem>(`/food/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  
  // Удалить запись
  deleteFoodItem: (id: number) => 
    apiRequest<void>(`/food/${id}/`, {
      method: 'DELETE',
    }),
};

export const statsApi = {
  // Статистика за день
  getDailyStats: (date: string) => 
    apiRequest<DailyStats>(`/stats/daily/?date=${date}`),
  
  // Статистика за период
  getPeriodStats: (period: 'day' | 'week' | 'month', endDate?: string) => {
    let url = `/stats/period/?period=${period}`;
    if (endDate) url += `&end_date=${endDate}`;
    return apiRequest<PeriodStats>(url);
  },
  
  // Рекомендуемые нормы
  getNutritionGoals: () => 
    apiRequest<{ goals: User['nutrition_goals']; user_info: Partial<User> }>('/stats/goals/'),
};

export { getAccessToken, getRefreshToken, setTokens, clearTokens, refreshAccessToken };