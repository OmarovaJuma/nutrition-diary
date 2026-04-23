# Дневник Питания - Full Stack Application

Полноценное веб-приложение для учета питания с расчетом КБЖУ, статистикой и рекомендациями.

## 🏗 Архитектура

```
/mnt/okcomputer/output/
├── app/                    # React Frontend
│   ├── src/
│   │   ├── components/    # React компоненты
│   │   ├── hooks/         # Хуки (useAuthApi, useFoodApi)
│   │   ├── services/      # API сервисы
│   │   └── App.tsx        # Главный компонент
│   ├── dist/              # Сборка для production
│   └── .env.example       # Пример переменных окружения
│
└── nutrition_backend/      # Django Backend
    ├── nutrition_backend/  # Настройки Django
    ├── api/               # Приложение API
    │   ├── models.py      # Модели User, FoodItem
    │   ├── serializers.py # Сериализаторы DRF
    │   ├── views.py       # API views
    │   └── urls.py        # URL маршруты
    ├── manage.py
    ├── requirements.txt
    └── README.md
```

## 🚀 Быстрый старт

### 1. Запуск Django Backend

```bash
cd nutrition_backend

# Создать виртуальное окружение
python -m venv venv

# Windows:
venv\Scripts\activate

# Установить зависимости
pip install -r requirements.txt

# Применить миграции
python manage.py migrate

# Создать суперпользователя
python manage.py createsuperuser

# Запустить сервер
python manage.py runserver
```

API будет доступно по адресу: `http://127.0.0.1:8000`

### 2. Запуск React Frontend

```bash
cd app

# Установить зависимости
npm install

# Создать .env файл
echo "VITE_API_URL=http://127.0.0.1:8000/api" > .env

# Запустить dev сервер
npm run dev
```

Frontend будет доступен по адресу: `http://localhost:5173`

## 📡 API Endpoints

### Аутентификация (JWT)

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/token/` | Получить JWT токен |
| POST | `/api/token/refresh/` | Обновить JWT токен |

### Пользователи

| Метод | Endpoint | Описание |
|-------|----------|----------|
| POST | `/api/auth/register/` | Регистрация |
| GET | `/api/auth/profile/` | Профиль пользователя |
| PATCH | `/api/auth/profile/update/` | Обновить профиль |

### Записи о пище

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/food/?date=2024-01-01` | Список записей |
| POST | `/api/food/` | Создать запись |
| GET | `/api/food/<id>/` | Получить запись |
| PATCH | `/api/food/<id>/` | Обновить запись |
| DELETE | `/api/food/<id>/` | Удалить запись |

### Статистика

| Метод | Endpoint | Описание |
|-------|----------|----------|
| GET | `/api/stats/daily/?date=2024-01-01` | Статистика за день |
| GET | `/api/stats/period/?period=week` | Статистика за период |
| GET | `/api/stats/goals/` | Рекомендуемые нормы КБЖУ |

## 📋 Примеры запросов

### Регистрация

```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "password_confirm": "password123",
    "name": "Иван Иванов",
    "gender": "male",
    "age": 30,
    "height": 180,
    "weight": 75,
    "activity_level": "moderate",
    "goal": "maintain"
  }'
```

### Вход

```bash
curl -X POST http://127.0.0.1:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Добавление записи

```bash
curl -X POST http://127.0.0.1:8000/api/food/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{
    "name": "Овсянка с ягодами",
    "calories": 350,
    "protein": 12,
    "fat": 6,
    "carbs": 58,
    "portion": 100,
    "date": "2024-01-15",
    "meal_type": "breakfast"
  }'
```

## 🔧 Настройка для Production

### Django

1. **Измените SECRET_KEY** в `settings.py`:
```python
SECRET_KEY = os.environ.get('SECRET_KEY')
```

2. **Отключите DEBUG**:
```python
DEBUG = False
```

3. **Настройте CORS**:
```python
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-domain.com",
]
```

4. **Используйте PostgreSQL**:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST'),
        'PORT': os.environ.get('DB_PORT'),
    }
}
```

### React

1. **Создайте production сборку**:
```bash
npm run build
```

2. **Настройте API URL**:
```bash
# .env.production
VITE_API_URL=https://your-api-domain.com/api
```

## 📁 Структура проекта (подробно)

### Backend (Django)

```
nutrition_backend/
├── nutrition_backend/          # Основной модуль Django
│   ├── __init__.py
│   ├── settings.py            # Настройки проекта
│   ├── urls.py                # Главные URL
│   ├── wsgi.py                # WSGI конфигурация
│   └── asgi.py                # ASGI конфигурация
│
├── api/                        # Приложение API
│   ├── migrations/            # Миграции БД
│   ├── __init__.py
│   ├── admin.py               # Настройки админки
│   ├── apps.py                # Конфигурация приложения
│   ├── managers.py            # Кастомный UserManager
│   ├── models.py              # Модели User, FoodItem
│   ├── serializers.py         # DRF сериализаторы
│   ├── urls.py                # URL API
│   └── views.py               # API представления
│
├── manage.py                   # Управление Django
├── requirements.txt            # Зависимости Python
├── .env.example               # Пример переменных окружения
├── .gitignore
└── README.md                   # Документация бэкенда
```

### Frontend (React)

```
app/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   └── AuthForms.tsx       # Формы входа/регистрации
│   │   ├── food/
│   │   │   ├── AddFoodForm.tsx     # Форма добавления еды
│   │   │   └── FoodList.tsx        # Список записей
│   │   ├── stats/
│   │   │   ├── DailyStats.tsx      # Статистика за день
│   │   │   ├── PeriodStats.tsx     # Статистика за период
│   │   │   └── NutritionGoals.tsx  # Рекомендуемые нормы
│   │   ├── Header.tsx              # Шапка приложения
│   │   └── DateSelector.tsx        # Выбор даты
│   │
│   ├── hooks/
│   │   ├── useAuthApi.tsx          # Хук авторизации
│   │   └── useFoodApi.ts           # Хук для работы с едой
│   │
│   ├── services/
│   │   └── api.ts                  # API сервисы
│   │
│   ├── App.tsx                     # Главный компонент
│   └── main.tsx                    # Точка входа
│
├── dist/                           # Сборка production
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── .env.example                    # Пример переменных окружения
```

## 🛠 Технологии

### Backend
- **Django 4.2+** - веб-фреймворк
- **Django REST Framework** - API
- **djangorestframework-simplejwt** - JWT аутентификация
- **django-cors-headers** - CORS
- **SQLite** (dev) / **PostgreSQL** (production)

### Frontend
- **React 18+** - UI библиотека
- **TypeScript** - типизация
- **Vite** - сборщик
- **Tailwind CSS** - стили
- **shadcn/ui** - компоненты UI

## 📊 Функционал

### ✅ Реализовано

1. **Авторизация и регистрация**
   - JWT токены
   - Регистрация с персональными данными
   - Профиль пользователя

2. **Учет питания**
   - Добавление продуктов/блюд
   - КБЖУ для каждой записи
   - Категории приемов пищи
   - История по дням

3. **Статистика**
   - Дневная статистика
   - Статистика за неделю/месяц
   - Сравнение с нормами
   - Прогресс-бары

4. **Рекомендации**
   - Расчет норм КБЖУ
   - Формула Миффлина-Сан Жеора
   - Персонализированные советы

## 📝 Лицензия

MIT License
