# Stage 1: Builder - Install dependencies
FROM python:3.11-slim as builder

WORKDIR /usr/src/app

# Set environment variables to optimize Python
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Install pip requirements
COPY requirements.txt .
RUN pip wheel --no-cache-dir --no-deps --wheel-dir /usr/src/app/wheels -r requirements.txt


# Stage 2: Final Image - Production
FROM python:3.11-slim

WORKDIR /usr/src/app

# Copy installed dependencies from builder stage
COPY --from=builder /usr/src/app/wheels /wheels
COPY --from=builder /usr/src/app/requirements.txt .
RUN pip install --no-cache /wheels/*

# Copy application code
COPY ./app ./app

# Command to run the application
# Uvicorn is a lightning-fast ASGI server, perfect for FastAPI
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]