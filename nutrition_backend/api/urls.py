from django.urls import path
from . import views

urlpatterns = [
    # Auth endpoints
    path('auth/register/', views.RegisterView.as_view(), name='register'),
    path('auth/profile/', views.UserProfileView.as_view(), name='profile'),
    path('auth/profile/update/', views.UserUpdateView.as_view(), name='profile-update'),
    
    # Food items endpoints
    path('food/', views.FoodItemListCreateView.as_view(), name='food-list-create'),
    path('food/<int:pk>/', views.FoodItemDetailView.as_view(), name='food-detail'),
    
    # Stats endpoints
    path('stats/daily/', views.daily_stats, name='daily-stats'),
    path('stats/period/', views.period_stats, name='period-stats'),
    path('stats/goals/', views.nutrition_goals, name='nutrition-goals'),
]
