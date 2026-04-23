import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFood } from '@/hooks/useFoodApi';
import { Plus, Utensils } from 'lucide-react';

interface AddFoodFormProps {
  selectedDate: Date;
}

export function AddFoodForm({ selectedDate }: AddFoodFormProps) {
  const { addFoodItem, fetchFoodItemsByDate } = useFood();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    calories: '',
    protein: '',
    fat: '',
    carbs: '',
    portion: '100',
    mealType: 'breakfast' as 'breakfast' | 'lunch' | 'dinner' | 'snack',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await addFoodItem({
        name: formData.name,
        calories: parseFloat(formData.calories) || 0,
        protein: parseFloat(formData.protein) || 0,
        fat: parseFloat(formData.fat) || 0,
        carbs: parseFloat(formData.carbs) || 0,
        portion: parseFloat(formData.portion) || 100,
        date: selectedDate.toISOString().split('T')[0],
        meal_type: formData.mealType,
      });

      await fetchFoodItemsByDate(selectedDate);

      setFormData({
        name: '',
        calories: '',
        protein: '',
        fat: '',
        carbs: '',
        portion: '100',
        mealType: 'breakfast',
      });
      setIsExpanded(false);
    } catch (error) {
      console.error('Failed to add food item:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isExpanded) {
    return (
      <Button 
        onClick={() => setIsExpanded(true)}
        className="w-full bg-emerald-600 hover:bg-emerald-700"
      >
        <Plus className="w-4 h-4 mr-2" />
        Добавить продукт или блюдо
      </Button>
    );
  }

  return (
    <Card className="border-emerald-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Utensils className="w-5 h-5 text-emerald-600" />
          Добавить продукт / блюдо
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="food-name">Название</Label>
            <Input
              id="food-name"
              placeholder="Например: Овсянка с ягодами"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meal-type">Прием пищи</Label>
            <Select
              value={formData.mealType}
              onValueChange={(value: 'breakfast' | 'lunch' | 'dinner' | 'snack') => 
                setFormData({ ...formData, mealType: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Завтрак</SelectItem>
                <SelectItem value="lunch">Обед</SelectItem>
                <SelectItem value="dinner">Ужин</SelectItem>
                <SelectItem value="snack">Перекус</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="portion">Порция (г)</Label>
              <Input
                id="portion"
                type="number"
                min={1}
                placeholder="100"
                value={formData.portion}
                onChange={(e) => setFormData({ ...formData, portion: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="calories">Калории</Label>
              <Input
                id="calories"
                type="number"
                min={0}
                placeholder="ккал"
                value={formData.calories}
                onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="protein" className="text-xs">Белки (г)</Label>
              <Input
                id="protein"
                type="number"
                min={0}
                step={0.1}
                placeholder="0"
                value={formData.protein}
                onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fat" className="text-xs">Жиры (г)</Label>
              <Input
                id="fat"
                type="number"
                min={0}
                step={0.1}
                placeholder="0"
                value={formData.fat}
                onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbs" className="text-xs">Углеводы (г)</Label>
              <Input
                id="carbs"
                type="number"
                min={0}
                step={0.1}
                placeholder="0"
                value={formData.carbs}
                onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1"
              onClick={() => setIsExpanded(false)}
              disabled={isSubmitting}
            >
              Отмена
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              disabled={isSubmitting}
              data-testid="submit-button"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Добавление...
                </span>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Добавить
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}