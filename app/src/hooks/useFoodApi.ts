import { useCallback, useState } from 'react';
import { foodApi, statsApi, type FoodItem, type DailyStats, type PeriodStats } from '@/services/api';

export function useFood() {
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Получить записи за дату (с учётом пагинации DRF)
  const fetchFoodItemsByDate = useCallback(async (date: Date) => {
    setIsLoading(true);
    setError(null);
    try {
      const dateStr = date.toISOString().split('T')[0];
      const response = await foodApi.getFoodItems({ date: dateStr });
      // Если ответ содержит поле results (пагинация), берём его, иначе считаем, что это массив
      const items = Array.isArray(response) ? response : (response as any).results || [];
      setFoodItems(items);
      return items;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch food items');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Добавить запись
  const addFoodItem = useCallback(async (item: Omit<FoodItem, 'id' | 'created_at'>) => {
    setIsLoading(true);
    setError(null);
    try {
      const newItem = await foodApi.createFoodItem(item);
      setFoodItems(prev => [...prev, newItem]);
      return newItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add food item');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Удалить запись
  const deleteFoodItem = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await foodApi.deleteFoodItem(id);
      setFoodItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete food item');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Обновить запись
  const updateFoodItem = useCallback(async (id: number, data: Partial<FoodItem>) => {
    setIsLoading(true);
    setError(null);
    try {
      const updatedItem = await foodApi.updateFoodItem(id, data);
      setFoodItems(prev => prev.map(item => item.id === id ? updatedItem : item));
      return updatedItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update food item');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Получить статистику за день
  const getDailyStats = useCallback(async (date: Date): Promise<DailyStats | null> => {
    try {
      const dateStr = date.toISOString().split('T')[0];
      return await statsApi.getDailyStats(dateStr);
    } catch (err) {
      console.error('Failed to get daily stats:', err);
      return null;
    }
  }, []);

  // Получить статистику за период
  const getPeriodStats = useCallback(async (
    period: 'day' | 'week' | 'month', 
    endDate?: Date
  ): Promise<PeriodStats | null> => {
    try {
      const endDateStr = endDate ? endDate.toISOString().split('T')[0] : undefined;
      return await statsApi.getPeriodStats(period, endDateStr);
    } catch (err) {
      console.error('Failed to get period stats:', err);
      return null;
    }
  }, []);

  // Получить записи по типу приема пищи
  const getFoodItemsByMealType = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    const items = foodItems.filter(item => item.date === dateStr);
    
    return {
      breakfast: items.filter(item => item.meal_type === 'breakfast'),
      lunch: items.filter(item => item.meal_type === 'lunch'),
      dinner: items.filter(item => item.meal_type === 'dinner'),
      snack: items.filter(item => item.meal_type === 'snack'),
    };
  }, [foodItems]);

  // Получить записи за дату
  const getFoodItemsByDate = useCallback((date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return foodItems.filter(item => item.date === dateStr);
  }, [foodItems]);

  return {
    foodItems,
    isLoading,
    error,
    addFoodItem,
    deleteFoodItem,
    updateFoodItem,
    fetchFoodItemsByDate,
    getFoodItemsByDate,
    getDailyStats,
    getPeriodStats,
    getFoodItemsByMealType,
  };
}