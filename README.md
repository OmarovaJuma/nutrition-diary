# Дневник Питания

Веб-приложение для учёта потребляемых продуктов, расчёта калорийности и макронутриентов (БЖУ) с персонализированными рекомендациями.

## Что умеет приложение

- Регистрация и авторизация пользователей (JWT).
- Ведение дневника питания с разбивкой по приёмам пищи (завтрак, обед, ужин, перекус).
- Добавление, редактирование и удаление записей о продуктах/блюдах с указанием КБЖУ и порции.
- Автоматический расчёт индивидуальных суточных норм калорий, белков, жиров и углеводов (формула Миффлина-Сан-Жеора).
- Статистика за день, неделю и месяц: суммарное потребление, средние значения, процент выполнения от нормы.
- Визуализация прогресса с помощью цветных индикаторов и прогресс-баров.
- Просмотр рекомендуемых норм КБЖУ, пересчитанных при изменении профиля.
- Адаптивный интерфейс, работающий на настольных и мобильных устройствах.

## Технологии

| Слой | Стек |
|------|------|
| Backend | Python 3.12, Django, Django REST Framework, djangorestframework-simplejwt, python-dateutil, psycopg2-binary |
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, lucide-react |
| Database | SQLite (разработка) / PostgreSQL 16 (продакшен) |
| Infra | Docker, Docker Compose, Nginx |

## Архитектура сервисов

Проект состоит из двух основных частей:

- `nutrition_backend/` — Django‑приложение, предоставляющее REST API и обслуживающее статику админки.
- `app/` — React‑приложение (SPA), собираемое с помощью Vite.

В Docker-режиме поднимаются следующие сервисы:

- `backend` — Django-сервер (через Gunicorn).
- `frontend` — Nginx, раздающий собранную статику React.
- (опционально) `db` — PostgreSQL (если используется вместо SQLite).

Порты по умолчанию:

- Приложение (Docker): `http://localhost`.
- Backend (локально без Docker): `http://127.0.0.1:8000`.
- Frontend dev server (локально без Docker): `http://localhost:5173`.
- PostgreSQL в Docker: `localhost:5432`.

## Переменные окружения

Файл шаблона: `.env.example` (в корне проекта и в `app/.env.example`).

### Backend (`.env` в `nutrition_backend/`)

| Переменная | Обязательна | По умолчанию | Описание |
|------------|-------------|--------------|-----------|
| `SECRET_KEY` | да | `django-insecure-...` | Секретный ключ Django |
| `DEBUG` | нет | `True` | Режим отладки (для продакшена установить `False`) |
| `DB_ENGINE` | нет | `django.db.backends.sqlite3` | Движок БД (`postgresql` для продакшена) |
| `DB_NAME` | для PostgreSQL | `nutrition_db` | Имя базы данных |
| `DB_USER` | для PostgreSQL | `nutrition_user` | Пользователь БД |
| `DB_PASSWORD` | для PostgreSQL | - | Пароль пользователя |
| `DB_HOST` | для PostgreSQL | `localhost` | Хост БД |
| `DB_PORT` | для PostgreSQL | `5432` | Порт БД |
| `CORS_ALLOWED_ORIGINS` | нет | `http://localhost:5173,http://127.0.0.1:5173` | Разрешённые источники для CORS |

### Frontend (`.env` в `app/`)

| Переменная | Обязательна | По умолчанию | Описание |
|------------|-------------|--------------|-----------|
| `VITE_API_URL` | да | `http://127.0.0.1:8000/api` | Базовый URL для запросов к API |

## Деплой в Docker (рекомендуется)

```bash
cp .env.example .env
# отредактируйте .env (укажите SECRET_KEY, отключите DEBUG и т.д.)
docker compose up --build
```
После запуска приложение будет доступно по адресу http://localhost.

Локально без Docker
1. Запуск бэкенда

```bash
cd nutrition_backend
python -m venv venv
venv\Scripts\activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # опционально
python manage.py runserver
```
Запуск фронтенда (в другом терминале)
```bash
cd app
npm install
echo "VITE_API_URL=http://127.0.0.1:8000/api" > .env
npm run dev
```
Откройте http://localhost:5173.

Примеры API-запросов
Регистрация
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "Иван",
    "password": "pass123",
    "password_confirm": "pass123",
    "gender": "male",
    "age": 30,
    "height": 180,
    "weight": 75,
    "activity_level": "moderate",
    "goal": "maintain"
  }'
```
Вход
```bash
curl -X POST http://127.0.0.1:8000/api/token/ \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "pass123"}'
```
Добавление продукта (требуется токен)
```bash
curl -X POST http://127.0.0.1:8000/api/food/ \
  -H "Authorization: Bearer <your_access_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Овсянка",
    "calories": 350,
    "protein": 12,
    "fat": 6,
    "carbs": 58,
    "portion": 100,
    "date": "2025-04-23",
    "meal_type": "breakfast"
  }'
```
Тестирование
Бэкенд: cd nutrition_backend && pytest --cov=api

Фронтенд: cd app && npm run test

Структура проекта (основное)
```
myApp/
├── app/                           # React Frontend
│   ├── src/
│   │   ├── components/            # UI-компоненты
│   │   ├── hooks/                 # Кастомные хуки
│   │   ├── services/              # API-сервис
│   │   ├── App.tsx                # Главный компонент
│   │   └── main.tsx               # Точка входа
│   ├── package.json
│   ├── vite.config.ts
│   └── .env.example
│
├── nutrition_backend/             # Django Backend
│   ├── api/                       # Основное приложение
│   │   ├── migrations/            # Миграции БД
│   │   ├── models.py              # Модели User, FoodItem
│   │   ├── serializers.py         # DRF сериализаторы
│   │   ├── views.py               # API представления
│   │   ├── urls.py                # Маршруты API
│   │   └── tests/                 # Тесты (pytest)
│   ├── nutrition_backend/         # Настройки Django
│   │   ├── settings.py
│   │   └── urls.py
│   ├── manage.py
│   ├── requirements.txt
│   ├── db.sqlite3
│   └── .env.example
│
├── docker/                        # Конфигурация Docker
│   └── nginx/
│       └── default.conf
├── Dockerfile.backend
├── Dockerfile.frontend
├── docker-compose.yml
└── README.md
```
