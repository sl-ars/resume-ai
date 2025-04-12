from .base import *
import environ

env = environ.Env()
environ.Env.read_env(BASE_DIR / '.env')

DEBUG = True
SECRET_KEY = env("SECRET_KEY")
ALLOWED_HOSTS = env.list("ALLOWED_HOSTS", default=['*'])

# Database configuration for development
DATABASES = {
    # PostgreSQL for users and jobs
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('POSTGRES_DB'),
        'USER': env('POSTGRES_USER'),
        'PASSWORD': env('POSTGRES_PASSWORD'),
        'HOST': env('POSTGRES_HOST'),
        'PORT': env('POSTGRES_PORT'),
    },
    # MySQL for analytics
    'mysql': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': env('MYSQL_DB'),
        'USER': env('MYSQL_USER'),
        'PASSWORD': env('MYSQL_PASSWORD'),
        'HOST': env('MYSQL_HOST'),
        'PORT': env('MYSQL_PORT'),
    }
}

# MongoDB configuration - accessed directly via pymongo
MONGODB_URI = env('MONGODB_HOST', default='mongodb://localhost:27017/')
MONGODB_DB = env('MONGODB_DB', default='resume_ai_mongodb')

# Redis configuration for caching and Celery
REDIS_HOST = env('REDIS_HOST')
REDIS_PORT = env('REDIS_PORT')