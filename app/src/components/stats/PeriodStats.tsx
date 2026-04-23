import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useFood } from '@/hooks/useFoodApi';
import { Flame, Dumbbell, Droplet, Wheat, TrendingUp, Calendar, Loader2 } from 'lucide-react';

interface PeriodStatsData {
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

export function PeriodStats() {
  const { getPeriodStats } = useFood();
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [stats, setStats] = useState<PeriodStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      const data = await getPeriodStats(period);
      setStats(data);
      setIsLoading(false);
    };

    fetchStats();
  }, [period, getPeriodStats]);

  const getProgressColor = (percent: number) => {
    if (percent < 80) return 'text-yellow-600';
    if (percent <= 100) return 'text-emerald-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
          <p className="text-gray-500 mt-4">Загрузка статистики...</p>
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

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Статистика за период
          </CardTitle>
          <Tabs value={period} onValueChange={(v) => setPeriod(v as 'week' | 'month')}>
            <TabsList className="h-8">
              <TabsTrigger value="week" className="text-xs px-3">Неделя</TabsTrigger>
              <TabsTrigger value="month" className="text-xs px-3">Месяц</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Calendar className="w-4 h-4" />
          {new Date(stats.start_date).toLocaleDateString('ru-RU')} — {new Date(stats.end_date).toLocaleDateString('ru-RU')}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Средние значения */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-emerald-50 p-3 rounded-lg">
            <div className="text-xs text-gray-600 mb-1">Среднее в день</div>
            <div className="text-xl font-bold text-emerald-700">{stats.average_calories.toFixed(0)}</div>
            <div className="text-xs text-gray-500">ккал</div>
          </div>
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-xs text-gray-600 mb-1">Всего за период</div>
            <div className="text-xl font-bold text-blue-700">{stats.total_calories.toFixed(0)}</div>
            <div className="text-xs text-gray-500">ккал</div>
          </div>
        </div>

        {/* Сравнение с рекомендациями */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-700">Сравнение с рекомендуемыми нормами</h4>

          {/* Калории */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm">Калории</span>
              </div>
              <span className={`text-sm font-semibold ${getProgressColor(stats.comparison.calories_percent)}`}>
                {stats.comparison.calories_percent}%
              </span>
            </div>
            <Progress value={Math.min(stats.comparison.calories_percent, 100)} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Факт: {stats.total_calories.toFixed(0)} ккал</span>
              <span>Норма: {stats.goals.calories} ккал</span>
            </div>
          </div>

          {/* Белки */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Dumbbell className="w-4 h-4 text-blue-500" />
                <span className="text-sm">Белки</span>
              </div>
              <span className={`text-sm font-semibold ${getProgressColor(stats.comparison.protein_percent)}`}>
                {stats.comparison.protein_percent}%
              </span>
            </div>
            <Progress value={Math.min(stats.comparison.protein_percent, 100)} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Факт: {stats.total_protein.toFixed(0)} г</span>
              <span>Норма: {stats.goals.protein} г</span>
            </div>
          </div>

          {/* Жиры */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplet className="w-4 h-4 text-yellow-500" />
                <span className="text-sm">Жиры</span>
              </div>
              <span className={`text-sm font-semibold ${getProgressColor(stats.comparison.fat_percent)}`}>
                {stats.comparison.fat_percent}%
              </span>
            </div>
            <Progress value={Math.min(stats.comparison.fat_percent, 100)} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Факт: {stats.total_fat.toFixed(0)} г</span>
              <span>Норма: {stats.goals.fat} г</span>
            </div>
          </div>

          {/* Углеводы */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Wheat className="w-4 h-4 text-amber-600" />
                <span className="text-sm">Углеводы</span>
              </div>
              <span className={`text-sm font-semibold ${getProgressColor(stats.comparison.carbs_percent)}`}>
                {stats.comparison.carbs_percent}%
              </span>
            </div>
            <Progress value={Math.min(stats.comparison.carbs_percent, 100)} className="h-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>Факт: {stats.total_carbs.toFixed(0)} г</span>
              <span>Норма: {stats.goals.carbs} г</span>
            </div>
          </div>
        </div>

        {/* Рекомендации */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Рекомендации</h4>
          <div className="space-y-2 text-sm">
            {stats.comparison.calories_percent < 90 && (
              <p className="text-yellow-600">
                ⚠️ Вы потребляете меньше калорий, чем рекомендуется. Попробуйте добавить больше питательных продуктов.
              </p>
            )}
            {stats.comparison.calories_percent > 110 && (
              <p className="text-red-600">
                ⚠️ Вы превышаете суточную норму калорий. Попробуйте контролировать размеры порций.
              </p>
            )}
            {stats.comparison.protein_percent < 80 && (
              <p className="text-blue-600">
                💡 Добавьте больше белка: мясо, рыба, яйца, бобовые, творог.
              </p>
            )}
            {stats.comparison.protein_percent > 120 && (
              <p className="text-blue-600">
                💡 Вы потребляете много белка. Убедитесь, что у вас достаточно жидкости.
              </p>
            )}
            {stats.comparison.fat_percent > 110 && (
              <p className="text-yellow-600">
                💡 Попробуйте снизить потребление жиров, особенно насыщенных.
              </p>
            )}
            {stats.comparison.carbs_percent > 110 && (
              <p className="text-amber-600">
                💡 Попробуйте выбирать сложные углеводы вместо простых сахаров.
              </p>
            )}
            {stats.comparison.calories_percent >= 90 && stats.comparison.calories_percent <= 110 &&
             stats.comparison.protein_percent >= 80 && stats.comparison.protein_percent <= 120 && (
              <p className="text-emerald-600">
                ✅ Отлично! Ваше питание соответствует рекомендуемым нормам.
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
