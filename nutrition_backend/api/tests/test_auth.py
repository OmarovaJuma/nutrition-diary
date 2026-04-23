import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()

@pytest.mark.django_db
def test_register_user_success():
    """Успешная регистрация нового пользователя"""
    client = APIClient()
    data = {
        'email': 'test@example.com',
        'name': 'Test User',
        'password': 'strongpass123',
        'password_confirm': 'strongpass123',
        'gender': 'female',
        'age': 25,
        'height': 165,
        'weight': 60,
        'activity_level': 'moderate',
        'goal': 'maintain',
    }
    response = client.post('/api/auth/register/', data, format='json')
    assert response.status_code == 201
    assert 'access' in response.data
    assert 'refresh' in response.data
    assert response.data['user']['email'] == 'test@example.com'

@pytest.mark.django_db
def test_register_user_email_exists():
    """Регистрация с уже существующим email → ошибка 400"""
    User.objects.create_user(email='existing@example.com', name='Existing', password='pass')
    client = APIClient()
    data = {
        'email': 'existing@example.com',
        'name': 'Another',
        'password': 'pass123',
        'password_confirm': 'pass123',
        'gender': 'male',
        'age': 30,
        'height': 180,
        'weight': 80,
        'activity_level': 'moderate',
        'goal': 'maintain',
    }
    response = client.post('/api/auth/register/', data, format='json')
    assert response.status_code == 400

@pytest.mark.django_db
def test_login_success():
    """Вход с верными данными → получаем токены"""
    User.objects.create_user(email='login@example.com', name='Login User', password='secret')
    client = APIClient()
    response = client.post('/api/token/', {'email': 'login@example.com', 'password': 'secret'}, format='json')
    assert response.status_code == 200
    assert 'access' in response.data
    assert 'refresh' in response.data

@pytest.mark.django_db
def test_login_wrong_password():
    """Вход с неверным паролем → 401"""
    User.objects.create_user(email='wrong@example.com', name='Wrong', password='correctpass')
    client = APIClient()
    response = client.post('/api/token/', {'email': 'wrong@example.com', 'password': 'wrongpass'}, format='json')
    assert response.status_code == 401