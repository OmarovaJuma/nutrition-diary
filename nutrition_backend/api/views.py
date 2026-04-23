from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.db.models import Sum
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta

from .models import FoodItem
from .serializers import (
    UserSerializer, 
    UserRegisterSerializer, 
    UserUpdateSerializer,
    FoodItemSerializer, 
    FoodItemCreateSerializer,
    DailyStatsSerializer,
    PeriodStatsSerializer,
)

User = get_user_model()


# ==================== AUTH VIEWS ====================

class RegisterView(generics.CreateAPIView):
    """Регистрация нового пользователя."""
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Генерируем токены
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)


class UserProfileView(generics.RetrieveUpdateAPIView):
    """Просмотр и обновление профиля пользователя."""
    serializer_class = UserSerializer
    #permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class UserUpdateView(generics.UpdateAPIView):
    """Обновление данных пользователя."""
    serializer_class = UserUpdateSerializer
    #permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


# ==================== FOOD ITEM VIEWS ====================

class FoodItemListCreateView(generics.ListCreateAPIView):
    """Список записей о пище и создание новой записи."""
    #permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return FoodItemCreateSerializer
        return FoodItemSerializer
    
    def get_queryset(self):
        """Фильтрация по пользователю и дате."""
        queryset = FoodItem.objects.filter(user=self.request.user)
        
        # Фильтр по дате
        date_param = self.request.query_params.get('date')
        if date_param:
            queryset = queryset.filter(date=date_param)
        
        # Фильтр по периоду
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date and end_date:
            queryset = queryset.filter(date__range=[start_date, end_date])
        
        # Фильтр по приему пищи
        meal_type = self.request.query_params.get('meal_type')
        if meal_type:
            queryset = queryset.filter(meal_type=meal_type)
        
        return queryset.order_by('-date', '-created_at')


class FoodItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Просмотр, обновление и удаление записи о пище."""
    serializer_class = FoodItemSerializer
    #permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return FoodItem.objects.filter(user=self.request.user)


# ==================== STATS VIEWS ====================

@api_view(['GET'])
#@permission_classes([permissions.IsAuthenticated])
def daily_stats(request):
    """Получение статистики за день."""
    date_str = request.query_params.get('date')
    
    if date_str:
        date = datetime.strptime(date_str, '%Y-%m-%d').date()
    else:
        date = datetime.now().date()
    
    user = request.user
    items = FoodItem.objects.filter(user=user, date=date)
    
    stats = {
        'date': date,
        'total_calories': sum(item.calories for item in items),
        'total_protein': sum(item.protein for item in items),
        'total_fat': sum(item.fat for item in items),
        'total_carbs': sum(item.carbs for item in items),
        'items': FoodItemSerializer(items, many=True).data,
    }
    
    return Response(stats)


@api_view(['GET'])
#@permission_classes([permissions.IsAuthenticated])
def period_stats(request):
    """Получение статистики за период."""
    period = request.query_params.get('period', 'week')
    end_date_str = request.query_params.get('end_date')
    
    if end_date_str:
        end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
    else:
        end_date = datetime.now().date()
    
    # Определяем начальную дату
    if period == 'week':
        start_date = end_date - timedelta(days=6)
        days_count = 7
    elif period == 'month':
        start_date = end_date - timedelta(days=29)
        days_count = 30
    else:  # day
        start_date = end_date
        days_count = 1
    
    user = request.user
    items = FoodItem.objects.filter(
        user=user, 
        date__range=[start_date, end_date]
    )
    
    # Расчет сумм
    total_calories = sum(item.calories for item in items)
    total_protein = sum(item.protein for item in items)
    total_fat = sum(item.fat for item in items)
    total_carbs = sum(item.carbs for item in items)
    
    # Расчет средних значений
    average_calories = total_calories / days_count if days_count > 0 else 0
    average_protein = total_protein / days_count if days_count > 0 else 0
    average_fat = total_fat / days_count if days_count > 0 else 0
    average_carbs = total_carbs / days_count if days_count > 0 else 0
    
    # Получение целей пользователя
    goals = user.get_nutrition_goals()
    period_goals = {
        'calories': goals['calories'] * days_count,
        'protein': goals['protein'] * days_count,
        'fat': goals['fat'] * days_count,
        'carbs': goals['carbs'] * days_count,
    }
    
    # Расчет процентов
    comparison = {
        'calories_percent': round((total_calories / period_goals['calories']) * 100) if period_goals['calories'] > 0 else 0,
        'protein_percent': round((total_protein / period_goals['protein']) * 100) if period_goals['protein'] > 0 else 0,
        'fat_percent': round((total_fat / period_goals['fat']) * 100) if period_goals['fat'] > 0 else 0,
        'carbs_percent': round((total_carbs / period_goals['carbs']) * 100) if period_goals['carbs'] > 0 else 0,
    }
    
    stats = {
        'period': period,
        'start_date': start_date,
        'end_date': end_date,
        'total_calories': round(total_calories, 1),
        'total_protein': round(total_protein, 1),
        'total_fat': round(total_fat, 1),
        'total_carbs': round(total_carbs, 1),
        'average_calories': round(average_calories, 1),
        'average_protein': round(average_protein, 1),
        'average_fat': round(average_fat, 1),
        'average_carbs': round(average_carbs, 1),
        'days_count': days_count,
        'goals': period_goals,
        'comparison': comparison,
    }
    
    return Response(stats)


@api_view(['GET'])
#@permission_classes([permissions.IsAuthenticated])
def nutrition_goals(request):
    """Получение рекомендуемых норм КБЖУ."""
    user = request.user
    goals = user.get_nutrition_goals()
    
    return Response({
        'goals': goals,
        'user_info': {
            'gender': user.gender,
            'age': user.age,
            'height': user.height,
            'weight': user.weight,
            'activity_level': user.activity_level,
            'goal': user.goal,
        }
    })
