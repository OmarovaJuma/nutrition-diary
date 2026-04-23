import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useFood } from '@/hooks/useFoodApi';
import { useAuth } from '@/hooks/useAuthApi';
import { Flame, Dumbbell, Droplet, Wheat, Loader2 } from 'lucide-react';

interface DailyStatsProps {
  selectedDate: Date;
}

interface Stats {
  date: string;
  total_calories: number;
  total_protein: number;
  total_fat: number;
  total_carbs: number;
  items: unknown[];
}

export function DailyStats({ selectedDate }: DailyStatsProps) {
  const { user } = useAuth();
  const { getDailyStats } = useFood();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      const data = await getDailyStats(selectedDate);
      setStats(data);
      setIsLoading(false);
    };
    
    fetchStats();
  }, [selectedDate, getDailyStats]);
  
  if (!user) return null;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
        <p className="text-gray-500 mt-2">Загрузка...</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-gray-500">Нет данных</p>
        </CardContent>
      </Card>
    );
  }

  const goals = user.nutrition_goals;

  const caloriesPercent = Math.min((stats.total_calories / goals.calories) * 100, 100);
  const proteinPercent = Math.min((stats.total_protein / goals.protein) * 100, 100);
  const fatPercent = Math.min((stats.total_fat / goals.fat) * 100, 100);
  const carbsPercent = Math.min((stats.total_carbs / goals.carbs) * 100, 100);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Статистика за день</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Калории */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-medium">Калории</span>
            </div>
            <span className="text-sm">
              <span className="font-semibold">{stats.total_calories.toFixed(0)}</span>
              <span className="text-gray-500"> / {goals.calories} ккал</span>
            </span>
          </div>
          <Progress value={caloriesPercent} className="h-2" />
          <div className="text-xs text-gray-500 text-right">
            {caloriesPercent.toFixed(0)}% от нормы
          </div>
        </div>

        {/* Белки */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Белки</span>
            </div>
            <span className="text-sm">
              <span className="font-semibold">{stats.total_protein.toFixed(1)}</span>
              <span className="text-gray-500"> / {goals.protein} г</span>
            </span>
          </div>
          <Progress value={proteinPercent} className="h-2" />
          <div className="text-xs text-gray-500 text-right">
            {proteinPercent.toFixed(0)}% от нормы
          </div>
        </div>

        {/* Жиры */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplet className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">Жиры</span>
            </div>
            <span className="text-sm">
              <span className="font-semibold">{stats.total_fat.toFixed(1)}</span>
              <span className="text-gray-500"> / {goals.fat} г</span>
            </span>
          </div>
          <Progress value={fatPercent} className="h-2" />
          <div className="text-xs text-gray-500 text-right">
            {fatPercent.toFixed(0)}% от нормы
          </div>
        </div>

        {/* Углеводы */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wheat className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium">Углеводы</span>
            </div>
            <span className="text-sm">
              <span className="font-semibold">{stats.total_carbs.toFixed(1)}</span>
              <span className="text-gray-500"> / {goals.carbs} г</span>
            </span>
          </div>
          <Progress value={carbsPercent} className="h-2" />
          <div className="text-xs text-gray-500 text-right">
            {carbsPercent.toFixed(0)}% от нормы
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
