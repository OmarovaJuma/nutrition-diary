import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

@pytest.mark.django_db
def test_add_food_item_authenticated():
    """Авторизованный пользователь может добавить продукт"""
    user = User.objects.create_user(email='food@example.com', name='Foodie', password='pass')
    client = APIClient()
    # Получаем токен
    token_response = client.post('/api/token/', {'email': 'food@example.com', 'password': 'pass'})
    token = token_response.data['access']
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {token}')
    
    data = {
        'name': 'Яблоко',
        'calories': 95,
        'protein': 0.5,
        'fat': 0.3,
        'carbs': 25,
        'portion': 100,
        'date': '2025-04-20',
        'meal_type': 'snack',
    }
    response = client.post('/api/food/', data, format='json')
    assert response.status_code == 201
    assert response.data['name'] == 'Яблоко'

@pytest.mark.django_db
def test_add_food_item_unauthenticated():
    """Неавторизованный пользователь не может добавить продукт → 401"""
    client = APIClient()
    data = {'name': 'Тест', 'calories': 100, 'portion': 100, 'date': '2025-04-20', 'meal_type': 'breakfast'}
    response = client.post('/api/food/', data, format='json')
    assert response.status_code == 401

@pytest.mark.django_db
def test_get_food_items_by_date():
    """Пользователь видит только свои записи за определённую дату"""
    user1 = User.objects.create_user(email='user1@example.com', name='One', password='pass')
    user2 = User.objects.create_user(email='user2@example.com', name='Two', password='pass')
    
    client1 = APIClient()
    token1 = client1.post('/api/token/', {'email': 'user1@example.com', 'password': 'pass'}).data['access']
    client1.credentials(HTTP_AUTHORIZATION=f'Bearer {token1}')
    
    # Добавляем продукт для user1
    client1.post('/api/food/', {'name': 'Продукт user1', 'calories': 100, 'portion': 100, 'date': '2025-04-20', 'meal_type': 'breakfast'})
    
    # Проверяем, что user1 видит свой продукт
    response = client1.get('/api/food/?date=2025-04-20')
    assert response.status_code == 200
    items = response.data if isinstance(response.data, list) else response.data.get('results', [])
    assert len(items) == 1
    assert items[0]['name'] == 'Продукт user1'
    
    # Проверяем, что user2 не видит чужой продукт
    client2 = APIClient()
    token2 = client2.post('/api/token/', {'email': 'user2@example.com', 'password': 'pass'}).data['access']
    client2.credentials(HTTP_AUTHORIZATION=f'Bearer {token2}')
    response2 = client2.get('/api/food/?date=2025-04-20')
    items2 = response2.data if isinstance(response2.data, list) else response2.data.get('results', [])
    assert len(items2) == 0