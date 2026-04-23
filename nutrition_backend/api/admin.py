from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, FoodItem


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    """Админка для пользователей."""
    
    list_display = [
        'email', 'name', 'gender', 'age', 'height', 
        'weight', 'activity_level', 'goal', 'is_staff', 'date_joined'
    ]
    list_filter = ['gender', 'activity_level', 'goal', 'is_staff', 'is_active']
    search_fields = ['email', 'name']
    ordering = ['-date_joined']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Персональная информация', {
            'fields': ('name', 'gender', 'age', 'height', 'weight')
        }),
        ('Цели и активность', {
            'fields': ('activity_level', 'goal')
        }),
        ('Права доступа', {
            'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')
        }),
        ('Важные даты', {'fields': ('last_login', 'date_joined')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'password1', 'password2'),
        }),
    )


@admin.register(FoodItem)
class FoodItemAdmin(admin.ModelAdmin):
    """Админка для записей о пище."""
    
    list_display = [
        'name', 'user', 'date', 'meal_type', 
        'calories', 'protein', 'fat', 'carbs', 'portion'
    ]
    list_filter = ['meal_type', 'date', 'created_at']
    search_fields = ['name', 'user__email', 'user__name']
    date_hierarchy = 'date'
    ordering = ['-date', '-created_at']
