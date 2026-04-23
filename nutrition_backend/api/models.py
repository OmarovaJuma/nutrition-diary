from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    """Кастомная модель пользователя."""
    
    GENDER_CHOICES = [
        ('male', 'Мужской'),
        ('female', 'Женский'),
    ]
    
    ACTIVITY_LEVEL_CHOICES = [
        ('low', 'Низкий'),
        ('moderate', 'Умеренный'),
        ('high', 'Высокий'),
        ('very_high', 'Очень высокий'),
    ]
    
    GOAL_CHOICES = [
        ('lose', 'Похудение'),
        ('maintain', 'Поддержание веса'),
        ('gain', 'Набор массы'),
    ]
    
    email = models.EmailField(_('email address'), unique=True)
    name = models.CharField(_('имя'), max_length=100)
    
    # Персональные данные
    gender = models.CharField(_('пол'), max_length=10, choices=GENDER_CHOICES, default='male')
    age = models.PositiveIntegerField(_('возраст'), default=25)
    height = models.PositiveIntegerField(_('рост (см)'), default=170)
    weight = models.PositiveIntegerField(_('вес (кг)'), default=70)
    activity_level = models.CharField(
        _('уровень активности'), 
        max_length=20, 
        choices=ACTIVITY_LEVEL_CHOICES, 
        default='moderate'
    )
    goal = models.CharField(_('цель'), max_length=20, choices=GOAL_CHOICES, default='maintain')
    
    # Django поля
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    date_joined = models.DateTimeField(default=timezone.now)
    
    objects = UserManager()
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['name']
    
    class Meta:
        verbose_name = _('пользователь')
        verbose_name_plural = _('пользователи')
    
    def __str__(self):
        return self.email
    
    def calculate_bmr(self):
        """Расчет базового метаболизма по формуле Миффлина-Сан Жеора."""
        if self.gender == 'male':
            bmr = 10 * self.weight + 6.25 * self.height - 5 * self.age + 5
        else:
            bmr = 10 * self.weight + 6.25 * self.height - 5 * self.age - 161
        return bmr
    
    def calculate_daily_calories(self):
        """Расчет суточной нормы калорий."""
        activity_multipliers = {
            'low': 1.2,
            'moderate': 1.375,
            'high': 1.55,
            'very_high': 1.725,
        }
        
        calories = self.calculate_bmr() * activity_multipliers[self.activity_level]
        
        # Корректировка по цели
        if self.goal == 'lose':
            calories -= 500
        elif self.goal == 'gain':
            calories += 500
            
        return round(calories)
    
    def get_nutrition_goals(self):
        """Получение рекомендуемых норм КБЖУ."""
        calories = self.calculate_daily_calories()
        
        # Распределение макронутриентов
        protein = round((calories * 0.25) / 4)  # 25% от калорий
        fat = round((calories * 0.30) / 9)      # 30% от калорий
        carbs = round((calories * 0.45) / 4)    # 45% от калорий
        
        return {
            'calories': calories,
            'protein': protein,
            'fat': fat,
            'carbs': carbs,
        }


class FoodItem(models.Model):
    """Модель записи о приеме пищи."""
    
    MEAL_TYPE_CHOICES = [
        ('breakfast', 'Завтрак'),
        ('lunch', 'Обед'),
        ('dinner', 'Ужин'),
        ('snack', 'Перекус'),
    ]
    
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='food_items',
        verbose_name=_('пользователь')
    )
    name = models.CharField(_('название'), max_length=200)
    calories = models.FloatField(_('калории'), default=0)
    protein = models.FloatField(_('белки'), default=0)
    fat = models.FloatField(_('жиры'), default=0)
    carbs = models.FloatField(_('углеводы'), default=0)
    portion = models.FloatField(_('порция (г)'), default=100)
    date = models.DateField(_('дата'))
    meal_type = models.CharField(
        _('прием пищи'), 
        max_length=20, 
        choices=MEAL_TYPE_CHOICES,
        default='breakfast'
    )
    created_at = models.DateTimeField(_('дата создания'), auto_now_add=True)
    
    class Meta:
        verbose_name = _('запись о пище')
        verbose_name_plural = _('записи о пище')
        ordering = ['-date', '-created_at']
        indexes = [
            models.Index(fields=['user', 'date']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.date})"
