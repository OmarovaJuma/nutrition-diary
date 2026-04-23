import React, { createContext, useContext, useState, useCallback } from 'react';
import type { User, RegisterData, AuthState } from '@/types';
import { useLocalStorage } from './useLocalStorage';

const AuthContext = createContext<AuthState | undefined>(undefined);

// Функция расчета рекомендуемого потребления КБЖУ
export function calculateNutritionGoals(user: User) {
  // Расчет базового метаболизма (BMR) по формуле Миффлина-Сан Жеора
  let bmr: number;
  if (user.gender === 'male') {
    bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age + 5;
  } else {
    bmr = 10 * user.weight + 6.25 * user.height - 5 * user.age - 161;
  }

  // Коэффициент активности
  const activityMultipliers = {
    low: 1.2,
    moderate: 1.375,
    high: 1.55,
    very_high: 1.725,
  };

  let calories = Math.round(bmr * activityMultipliers[user.activityLevel]);

  // Корректировка по цели
  if (user.goal === 'lose') {
    calories -= 500; // Дефицит 500 ккал для похудения
  } else if (user.goal === 'gain') {
    calories += 500; // Профицит 500 ккал для набора массы
  }

  // Распределение макронутриентов
  // Белки: 25-30% от калорий (4 ккал/г)
  // Жиры: 25-30% от калорий (9 ккал/г)
  // Углеводы: 40-50% от калорий (4 ккал/г)

  const protein = Math.round((calories * 0.25) / 4);
  const fat = Math.round((calories * 0.30) / 9);
  const carbs = Math.round((calories * 0.45) / 4);

  return { calories, protein, fat, carbs };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useLocalStorage<User[]>('nutrition_users', []);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('nutrition_current_user', null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!currentUser);

  const login = useCallback(async (email: string, _password: string): Promise<boolean> => {
    const user = users.find(u => u.email === email);
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, [users, setCurrentUser]);

  const register = useCallback(async (userData: RegisterData): Promise<boolean> => {
    const existingUser = users.find(u => u.email === userData.email);
    if (existingUser) {
      return false;
    }

    const newUser: User = {
      id: Date.now().toString(),
      email: userData.email,
      name: userData.name,
      gender: userData.gender,
      age: userData.age,
      height: userData.height,
      weight: userData.weight,
      activityLevel: userData.activityLevel,
      goal: userData.goal,
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    return true;
  }, [users, setUsers, setCurrentUser]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setIsAuthenticated(false);
  }, [setCurrentUser]);

  const updateUser = useCallback((userData: Partial<User>) => {
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      setCurrentUser(updatedUser);
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    }
  }, [currentUser, setCurrentUser, setUsers]);

  return (
    <AuthContext.Provider value={{
      user: currentUser,
      isAuthenticated,
      login,
      register,
      logout,
      updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
