// Типы для дневника питания

export interface User {
  id: string;
  email: string;
  name: string;
  gender: 'male' | 'female';
  age: number;
  height: number; // в см
  weight: number; // в кг
  activityLevel: 'low' | 'moderate' | 'high' | 'very_high';
  goal: 'lose' | 'maintain' | 'gain';
}

export interface NutritionGoals {
  calories: number;
  protein: number; // в граммах
  fat: number; // в граммах
  carbs: number; // в граммах
}

export interface FoodItem {
  id: string;
  userId: string;
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  portion: number; // размер порции в граммах
  date: string; // ISO строка даты
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  createdAt: string;
}

export interface DailyStats {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  items: FoodItem[];
}

export interface PeriodStats {
  period: 'day' | 'week' | 'month';
  startDate: string;
  endDate: string;
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  averageCalories: number;
  averageProtein: number;
  averageFat: number;
  averageCarbs: number;
  daysCount: number;
  goals: NutritionGoals;
  comparison: {
    caloriesPercent: number;
    proteinPercent: number;
    fatPercent: number;
    carbsPercent: number;
  };
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  gender: 'male' | 'female';
  age: number;
  height: number;
  weight: number;
  activityLevel: 'low' | 'moderate' | 'high' | 'very_high';
  goal: 'lose' | 'maintain' | 'gain';
}
