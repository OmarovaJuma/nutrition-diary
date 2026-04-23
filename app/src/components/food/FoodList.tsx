import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFood } from '@/hooks/useFoodApi';
import { Trash2, Coffee, Sun, Moon, Cookie, Loader2 } from 'lucide-react';

interface FoodListProps {
  selectedDate: Date;
}

const mealTypeLabels = {
  breakfast: 'Завтрак',
  lunch: 'Обед',
  dinner: 'Ужин',
  snack: 'Перекус',
};

const mealTypeIcons = {
  breakfast: Coffee,
  lunch: Sun,
  dinner: Moon,
  snack: Cookie,
};

export function FoodList({ selectedDate }: FoodListProps) {
  const { fetchFoodItemsByDate, deleteFoodItem, foodItems, isLoading } = useFood();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    fetchFoodItemsByDate(selectedDate);
  }, [selectedDate, fetchFoodItemsByDate]);

  // Защита: убеждаемся, что foodItems - массив
  const itemsArray = Array.isArray(foodItems) ? foodItems : [];

  // Группируем по типу приема пищи
  const meals = {
    breakfast: itemsArray.filter(item => item.meal_type === 'breakfast'),
    lunch: itemsArray.filter(item => item.meal_type === 'lunch'),
    dinner: itemsArray.filter(item => item.meal_type === 'dinner'),
    snack: itemsArray.filter(item => item.meal_type === 'snack'),
  };

  const hasAnyItems = Object.values(meals).some(items => items.length > 0);

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await deleteFoodItem(id);
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gray-50">
        <CardContent className="py-8 text-center">
          <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
          <p className="text-gray-500 mt-2">Загрузка...</p>
        </CardContent>
      </Card>
    );
  }

  if (!hasAnyItems) {
    return (
      <Card className="bg-gray-50 border-dashed">
        <CardContent className="py-8 text-center">
          <p className="text-gray-500">Нет записей за этот день</p>
          <p className="text-gray-400 text-sm mt-1">Добавьте свою первую запись выше</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {(Object.keys(meals) as Array<keyof typeof meals>).map((mealType) => {
        const items = meals[mealType];
        if (items.length === 0) return null;

        const Icon = mealTypeIcons[mealType];
        const totalCalories = items.reduce((sum, item) => sum + item.calories, 0);
        const totalProtein = items.reduce((sum, item) => sum + item.protein, 0);
        const totalFat = items.reduce((sum, item) => sum + item.fat, 0);
        const totalCarbs = items.reduce((sum, item) => sum + item.carbs, 0);

        return (
          <Card key={mealType} className="overflow-hidden">
            <CardHeader className="bg-emerald-50 py-3">
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-emerald-600" />
                  {mealTypeLabels[mealType]}
                </div>
                <span className="text-sm text-gray-600">
                  {totalCalories.toFixed(0)} ккал
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {items.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between p-3 border-b last:border-b-0 hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500">
                      {item.portion}г • {item.calories} ккал
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      Б: {item.protein}г • Ж: {item.fat}г • У: {item.carbs}г
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    {deletingId === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
              <div className="px-3 py-2 bg-gray-50 text-xs text-gray-600">
                Итого: Б {totalProtein.toFixed(1)}г • Ж {totalFat.toFixed(1)}г • У {totalCarbs.toFixed(1)}г
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}