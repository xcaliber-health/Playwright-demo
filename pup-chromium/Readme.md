# Playwright Demo Backend Server

## Docker Setup

### Using Docker

1. Build the Docker image:
    ```bash
    docker build -t playwright-demo .
    ```

2. Run the container:
    ```bash
    docker run -p 3000:3000 -p 8080:8080 playwright-demo
    ```

### Using Docker Compose

1. Start the services:
    ```bash
    docker-compose up
    ```

2. Stop the services:
    ```bash
    docker-compose down
    ```

## Environment Variables 

```
GEMINI_API_KEY= // use Gemini key for now. Will replace with lite llm soon
```
