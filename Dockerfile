# 1. Use minimal Node.js image
FROM node:18-slim AS base

# 2. Set working directory
WORKDIR /app

# 3. Install system dependencies for native modules
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# 4. Install dependencies securely
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force


# 5. Copy application source code
COPY . .

# 6. Create non-root user with specific UID/GID
RUN groupadd -r -g 1001 appgroup && \
    useradd -r -u 1001 -g appgroup -m -s /bin/bash appuser && \
    chown -R appuser:appgroup /app

# 7. Switch to non-root user
USER appuser

# 8. Set production environment
ENV NODE_ENV=production

# 9. Expose the port used by your server
EXPOSE 5050

# 10. Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:5050/health || exit 1

# 11. Define default command
CMD ["node", "server.js"]
