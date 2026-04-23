import { useCallback, useMemo } from 'react';
import type { FoodItem, DailyStats, PeriodStats, NutritionGoals } from '@/types';
import { useLocalStorage } from './useLocalStorage';
import { useAuth, calculateNutritionGoals } from './useAuth';

export function useFood() {
  const { user } = useAuth();
  const [foodItems, setFoodItems] = useLocalStorage<FoodItem[]>('nutrition_food_items', []);

  const userFoodItems = useMemo(() => {
    if (!user) return [];
    return foodItems.filter(item => item.userId === user.id);
  }, [foodItems, user]);

  const addFoodItem = useCallback((item: Omit<FoodItem, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    
    const newItem: FoodItem = {
      ...item,
      id: Date.now().toString(),
      userId: user.id,
      createdAt: new Date().toISOString(),
    };
    
    setFoodItems(prev => [...prev, newItem]);
  }, [user, setFoodItems]);

  const deleteFoodItem = useCallback((id: string) => {
    setFoodItems(prev => prev.filter(item => item.id !== id));
  }, [setFoodItems]);

  const getFoodItemsByDate = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return userFoodItems.filter(item => item.date === dateStr);
  }, [userFoodItems]);

  const getDailyStats = useCallback((date: Date): DailyStats => {
    const items = getFoodItemsByDate(date);
    const dateStr = date.toISOString().split('T')[0];
    
    return {
      date: dateStr,
      totalCalories: items.reduce((sum, item) => sum + item.calories, 0),
      totalProtein: items.reduce((sum, item) => sum + item.protein, 0),
      totalFat: items.reduce((sum, item) => sum + item.fat, 0),
      totalCarbs: items.reduce((sum, item) => sum + item.carbs, 0),
      items,
    };
  }, [getFoodItemsByDate]);

  const getPeriodStats = useCallback((period: 'day' | 'week' | 'month', endDate: Date = new Date()): PeriodStats | null => {
    if (!user) return null;

    const goals = calculateNutritionGoals(user);
    let startDate = new Date(endDate);
    let daysCount = 1;

    if (period === 'week') {
      startDate.setDate(endDate.getDate() - 6);
      daysCount = 7;
    } else if (period === 'month') {
      startDate.setDate(endDate.getDate() - 29);
      daysCount = 30;
    }

    const items: FoodItem[] = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      items.push(...getFoodItemsByDate(new Date(d)));
    }

    const totalCalories = items.reduce((sum, item) => sum + item.calories, 0);
    const totalProtein = items.reduce((sum, item) => sum + item.protein, 0);
    const totalFat = items.reduce((sum, item) => sum + item.fat, 0);
    const totalCarbs = items.reduce((sum, item) => sum + item.carbs, 0);

    // Для дневной статистики используем цели напрямую, для недели/месяца - умножаем
    const periodGoals: NutritionGoals = {
      calories: goals.calories * (period === 'day' ? 1 : daysCount),
      protein: goals.protein * (period === 'day' ? 1 : daysCount),
      fat: goals.fat * (period === 'day' ? 1 : daysCount),
      carbs: goals.carbs * (period === 'day' ? 1 : daysCount),
    };

    return {
      period,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      totalCalories,
      totalProtein,
      totalFat,
      totalCarbs,
      averageCalories: Math.round(totalCalories / daysCount),
      averageProtein: Math.round(totalProtein / daysCount),
      averageFat: Math.round(totalFat / daysCount),
      averageCarbs: Math.round(totalCarbs / daysCount),
      daysCount,
      goals: periodGoals,
      comparison: {
        caloriesPercent: Math.round((totalCalories / periodGoals.calories) * 100),
        proteinPercent: Math.round((totalProtein / periodGoals.protein) * 100),
        fatPercent: Math.round((totalFat / periodGoals.fat) * 100),
        carbsPercent: Math.round((totalCarbs / periodGoals.carbs) * 100),
      },
    };
  }, [user, getFoodItemsByDate]);

  const getFoodItemsByMealType = useCallback((date: Date) => {
    const items = getFoodItemsByDate(date);
    return {
      breakfast: items.filter(item => item.mealType === 'breakfast'),
      lunch: items.filter(item => item.mealType === 'lunch'),
      dinner: items.filter(item => item.mealType === 'dinner'),
      snack: items.filter(item => item.mealType === 'snack'),
    };
  }, [getFoodItemsByDate]);

  return {
    foodItems: userFoodItems,
    addFoodItem,
    deleteFoodItem,
    getFoodItemsByDate,
    getDailyStats,
    getPeriodStats,
    getFoodItemsByMealType,
  };
}
