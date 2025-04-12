from .base import *
import environ

env = environ.Env()
environ.Env.read_env(BASE_DIR / ".env")

DEBUG = False
SECRET_KEY = env("SECRET_KEY")
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS')

# Production database configuration
DATABASES = {
    # PostgreSQL for users and jobs
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('POSTGRES_DB'),
        'USER': env('POSTGRES_USER'),
        'PASSWORD': env('POSTGRES_PASSWORD'),
        'HOST': env('POSTGRES_HOST'),
        'PORT': env('POSTGRES_PORT'),
        'CONN_MAX_AGE': 600,  # Connection pooling - 10 minutes
        'OPTIONS': {
            'sslmode': env('POSTGRES_SSL_MODE', default='prefer'),
        },
    },
    # MySQL for analytics
    'mysql': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': env('MYSQL_DB'),
        'USER': env('MYSQL_USER'),
        'PASSWORD': env('MYSQL_PASSWORD'),
        'HOST': env('MYSQL_HOST'),
        'PORT': env('MYSQL_PORT'),
        'OPTIONS': {
            'charset': 'utf8mb4',
            'ssl': env.bool('MYSQL_SSL', default=False),
        },
    }
}

# MongoDB configuration - accessed directly via pymongo
MONGODB_URI = env('MONGODB_HOST', default='mongodb://localhost:27017/')
MONGODB_DB = env('MONGODB_DB', default='resume_ai_mongodb')
MONGODB_SSL = env.bool('MONGODB_SSL', default=False)

# Redis configuration for caching and Celery
REDIS_HOST = env('REDIS_HOST')
REDIS_PORT = env('REDIS_PORT')
REDIS_PASSWORD = env('REDIS_PASSWORD', default=None)
REDIS_SSL = env.bool('REDIS_SSL', default=False)