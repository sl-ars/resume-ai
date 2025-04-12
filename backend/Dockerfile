# Stage 1: Builder
FROM python:3.12-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install pip and uv
RUN pip install --no-cache-dir --upgrade pip uv

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN uv pip install --system --no-cache-dir -e .

# Stage 2: Runtime
FROM python:3.12-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    default-libmysqlclient-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.12/site-packages /usr/local/lib/python3.12/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    DJANGO_ENV=prod

# Create directory for logs
RUN mkdir -p /app/logs

# Copy project files
COPY . .

# Create media and static directories
RUN mkdir -p /app/media /app/staticfiles

# Expose the Django port
EXPOSE 8000

# Run Django server
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "resume_ai.wsgi:application"] 