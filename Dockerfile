FROM node:18-alpine

WORKDIR /app

# Copy backend package files
COPY backend/package*.json ./backend/

# Copy frontend build
COPY frontend/build ./frontend/build

# Install backend dependencies
RUN cd backend && npm ci --only=production

# Copy backend source
COPY backend ./backend

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Start production server
CMD ["node", "backend/server-prod.js"]
