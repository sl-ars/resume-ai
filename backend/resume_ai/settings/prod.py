from .base import *
import environ

env = environ.Env()
environ.Env.read_env(BASE_DIR / '.env')

DEBUG = False
SECRET_KEY = env("SECRET_KEY")
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS')

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': env('POSTGRES_DB'),
        'USER': env('POSTGRES_USER'),
        'PASSWORD': env('POSTGRES_PASSWORD'),
        'HOST': env('POSTGRES_HOST'),
        'PORT': str(env('POSTGRES_PORT')),
        'CONN_MAX_AGE': 600,
        'ATOMIC_REQUESTS': True,
        'OPTIONS': {
            'sslmode': env('POSTGRES_SSL_MODE', default='prefer'),
        },
    },
    'mysql': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': env('MYSQL_DB'),
        'USER': env('MYSQL_USER'),
        'PASSWORD': env('MYSQL_PASSWORD'),
        'HOST': env('MYSQL_HOST'),
        'PORT': str(env('MYSQL_PORT')),
        'OPTIONS': {
            'charset': 'utf8mb4',
            'ssl': env.bool('MYSQL_SSL', default=False),
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES'",
        },
    }
}

# MongoDB configuration
MONGODB_URI = env('MONGODB_HOST', default='mongodb://localhost:27017/')
MONGODB_DB = env('MONGODB_DB', default='resume_ai_mongodb')
MONGODB_SSL = env.bool('MONGODB_SSL', default=False)

# Redis configuration
REDIS_HOST = env('REDIS_HOST')
REDIS_PORT = env('REDIS_PORT')
REDIS_PASSWORD = env('REDIS_PASSWORD', default=None)
REDIS_SSL = env.bool('REDIS_SSL', default=False)