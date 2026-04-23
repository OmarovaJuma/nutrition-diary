import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuthApi';
import { Target, Flame, Dumbbell, Droplet, Wheat, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function NutritionGoals() {
  const { user } = useAuth();
  
  if (!user) return null;

  const goals = user.nutrition_goals;

  const activityLabels = {
    low: 'Низкий (сидячий образ жизни)',
    moderate: 'Умеренный (легкие тренировки 1-3 раза в неделю)',
    high: 'Высокий (активные тренировки 3-5 раз в неделю)',
    very_high: 'Очень высокий (интенсивные тренировки 6-7 раз в неделю)',
  };

  const goalLabels = {
    lose: 'Похудение (дефицит 500 ккал)',
    maintain: 'Поддержание веса',
    gain: 'Набор массы (профицит 500 ккал)',
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-600" />
          Ваши рекомендуемые нормы
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Основная информация */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-gray-50 p-2 rounded">
            <span className="text-gray-500">Пол:</span>{' '}
            <span className="font-medium">{user.gender === 'male' ? 'Мужской' : 'Женский'}</span>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <span className="text-gray-500">Возраст:</span>{' '}
            <span className="font-medium">{user.age} лет</span>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <span className="text-gray-500">Рост:</span>{' '}
            <span className="font-medium">{user.height} см</span>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <span className="text-gray-500">Вес:</span>{' '}
            <span className="font-medium">{user.weight} кг</span>
          </div>
        </div>

        {/* Активность и цель */}
        <div className="space-y-2 text-sm">
          <div>
            <span className="text-gray-500">Уровень активности:</span>
            <p className="font-medium">{activityLabels[user.activity_level]}</p>
          </div>
          <div>
            <span className="text-gray-500">Цель:</span>
            <p className="font-medium">{goalLabels[user.goal]}</p>
          </div>
        </div>

        {/* Нормы КБЖУ */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Суточные нормы</h4>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-orange-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-gray-600">Калории</span>
              </div>
              <div className="text-2xl font-bold text-orange-700">{goals.calories}</div>
              <div className="text-xs text-gray-500">ккал/день</div>
            </div>

            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Dumbbell className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600">Белки</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">
                        Белки необходимы для роста и восстановления мышц. 
                        Источники: мясо, рыба, яйца, бобовые, творог.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="text-2xl font-bold text-blue-700">{goals.protein}</div>
              <div className="text-xs text-gray-500">г/день</div>
            </div>

            <div className="bg-yellow-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Droplet className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-gray-600">Жиры</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">
                        Жиры нужны для гормонального баланса и усвоения витаминов. 
                        Предпочитайте полезные жиры: оливковое масло, авокадо, орехи.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="text-2xl font-bold text-yellow-700">{goals.fat}</div>
              <div className="text-xs text-gray-500">г/день</div>
            </div>

            <div className="bg-amber-50 p-3 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Wheat className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-gray-600">Углеводы</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3 h-3 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs text-xs">
                        Углеводы - основной источник энергии. 
                        Выбирайте сложные углеводы: крупы, овощи, цельнозерновые продукты.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="text-2xl font-bold text-amber-700">{goals.carbs}</div>
              <div className="text-xs text-gray-500">г/день</div>
            </div>
          </div>
        </div>

        {/* Пояснение расчета */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <p className="mb-1">
            <strong>Как рассчитаны нормы:</strong>
          </p>
          <p>
            Используется формула Миффлина-Сан Жеора для расчета базового метаболизма (BMR), 
            умноженная на коэффициент активности. При цели "похудение" создается дефицит 
            500 ккал, при "наборе массы" - профицит 500 ккал.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
