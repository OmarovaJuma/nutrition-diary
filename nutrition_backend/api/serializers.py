from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import FoodItem

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Сериализатор для пользователя."""
    
    nutrition_goals = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'name', 'gender', 'age', 'height', 
            'weight', 'activity_level', 'goal', 'nutrition_goals'
        ]
        read_only_fields = ['id']
    
    def get_nutrition_goals(self, obj):
        """Получение рекомендуемых норм КБЖУ."""
        return obj.get_nutrition_goals()


class UserRegisterSerializer(serializers.ModelSerializer):
    """Сериализатор для регистрации пользователя."""
    
    password = serializers.CharField(write_only=True, min_length=6)
    password_confirm = serializers.CharField(write_only=True, min_length=6)
    
    class Meta:
        model = User
        fields = [
            'email', 'password', 'password_confirm', 'name', 
            'gender', 'age', 'height', 'weight', 'activity_level', 'goal'
        ]
    
    def validate(self, attrs):
        """Валидация паролей."""
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({
                'password_confirm': 'Пароли не совпадают'
            })
        return attrs
    
    def create(self, validated_data):
        """Создание пользователя."""
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Сериализатор для обновления данных пользователя."""
    
    class Meta:
        model = User
        fields = [
            'name', 'gender', 'age', 'height', 
            'weight', 'activity_level', 'goal'
        ]


class FoodItemSerializer(serializers.ModelSerializer):
    """Сериализатор для записей о пище."""
    
    class Meta:
        model = FoodItem
        fields = [
            'id', 'name', 'calories', 'protein', 'fat', 
            'carbs', 'portion', 'date', 'meal_type', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def validate_date(self, value):
        """Валидация даты."""
        from datetime import date
        if value > date.today():
            raise serializers.ValidationError(
                'Дата не может быть в будущем'
            )
        return value


class FoodItemCreateSerializer(serializers.ModelSerializer):
    """Сериализатор для создания записи о пище."""
    
    class Meta:
        model = FoodItem
        fields = [
            'name', 'calories', 'protein', 'fat', 
            'carbs', 'portion', 'date', 'meal_type'
        ]
    
    def create(self, validated_data):
        """Создание записи с текущим пользователем."""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class DailyStatsSerializer(serializers.Serializer):
    """Сериализатор для дневной статистики."""
    
    date = serializers.DateField()
    total_calories = serializers.FloatField()
    total_protein = serializers.FloatField()
    total_fat = serializers.FloatField()
    total_carbs = serializers.FloatField()
    items = FoodItemSerializer(many=True)


class PeriodStatsSerializer(serializers.Serializer):
    """Сериализатор для статистики за период."""
    
    period = serializers.ChoiceField(choices=['day', 'week', 'month'])
    start_date = serializers.DateField()
    end_date = serializers.DateField()
    total_calories = serializers.FloatField()
    total_protein = serializers.FloatField()
    total_fat = serializers.FloatField()
    total_carbs = serializers.FloatField()
    average_calories = serializers.FloatField()
    average_protein = serializers.FloatField()
    average_fat = serializers.FloatField()
    average_carbs = serializers.FloatField()
    days_count = serializers.IntegerField()
    goals = serializers.DictField()
    comparison = serializers.DictField()
