FROM node:18

# Install necessary dependencies
RUN apt-get update && apt-get install -y \
    xvfb \
    x11vnc \
    novnc \
    websockify \
    supervisor \
    fluxbox \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libx11-xcb1 \
    libnss3 \
    libxcomposite1 \
    libxrandr2 \
    libasound2 \
    libpangocairo-1.0-0 \
    libgtk-3-0 \
    libxdamage1 \
    libgbm1 \
    wget \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Set up working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies without dev dependencies
RUN npm ci --omit=dev

# Install Playwright and ensure all necessary dependencies are installed
RUN npx playwright install --with-deps chromium \
    && npx playwright install-deps chromium

# Set environment variables to ensure Playwright finds its installed browsers
ENV PLAYWRIGHT_BROWSERS_PATH=/root/.cache/ms-playwright
ENV PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/root/.cache/ms-playwright/chromium-1155/chrome-linux/chrome

# Verify that the Chromium binary exists before proceeding
RUN ls -l /root/.cache/ms-playwright/chromium-1155/chrome-linux/chrome || echo "Chromium not found!"

# Copy remaining project files
COPY . .

# Copy Supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Expose necessary ports
EXPOSE 3000 8080 5900

# Set correct noVNC command path
RUN ln -s /usr/share/novnc/utils/novnc_proxy /usr/bin/novnc_proxy

# Start services using JSON CMD format
CMD ["sh", "-c", "Xvfb :99 -screen 0 1920x1080x24 & sleep 2 && fluxbox & sleep 2 && x11vnc -display :99 -forever -nopw -bg -rfbport 5900 & novnc_proxy --vnc localhost:5900 --listen 8080 & node server.js"]