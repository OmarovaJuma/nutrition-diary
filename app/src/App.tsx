import { useState } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuthApi';
import { AuthForms } from '@/components/auth/AuthForms';
import { Header } from '@/components/Header';
import { DateSelector } from '@/components/DateSelector';
import { AddFoodForm } from '@/components/food/AddFoodForm';
import { FoodList } from '@/components/food/FoodList';
import { DailyStats } from '@/components/stats/DailyStats';
import { PeriodStats } from '@/components/stats/PeriodStats';
import { NutritionGoals } from '@/components/stats/NutritionGoals';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2 } from 'lucide-react';

function MainApp() {
  const { isAuthenticated, isLoading } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthForms />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs defaultValue="diary" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="diary">Дневник</TabsTrigger>
            <TabsTrigger value="stats">Статистика</TabsTrigger>
            <TabsTrigger value="goals">Нормы</TabsTrigger>
          </TabsList>

          <TabsContent value="diary" className="space-y-6">
            <DateSelector 
              selectedDate={selectedDate} 
              onDateChange={setSelectedDate} 
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <AddFoodForm selectedDate={selectedDate} />
                <FoodList selectedDate={selectedDate} />
              </div>
              
              <div>
                <DailyStats selectedDate={selectedDate} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="stats" className="max-w-2xl mx-auto">
            <PeriodStats />
          </TabsContent>

          <TabsContent value="goals" className="max-w-2xl mx-auto">
            <NutritionGoals />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
