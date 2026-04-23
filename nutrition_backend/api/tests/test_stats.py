import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

@pytest.mark.django_db
def test_daily_stats():
    """Статистика за день суммирует калории и БЖУ"""
    user = User.objects.create_user(email='stats@example.com', name='Stats', password='pass')
    client = APIClient()
    token = client.post('/api/token/', {'email': 'stats@example.com', 'password': 'pass'}).data['access']
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    
    # Добавляем два продукта
    client.post('/api/food/', {'name': 'Овсянка', 'calories': 350, 'protein': 12, 'fat': 6, 'carbs': 58, 'portion': 100, 'date': '2025-04-20', 'meal_type': 'breakfast'})
    client.post('/api/food/', {'name': 'Яблоко', 'calories': 95, 'protein': 0.5, 'fat': 0.3, 'carbs': 25, 'portion': 100, 'date': '2025-04-20', 'meal_type': 'snack'})
    
    response = client.get('/api/stats/daily/?date=2025-04-20')
    assert response.status_code == 200
    assert response.data['total_calories'] == 350 + 95
    assert response.data['total_protein'] == 12 + 0.5
    assert response.data['total_fat'] == 6 + 0.3
    assert response.data['total_carbs'] == 58 + 25
    assert len(response.data['items']) == 2