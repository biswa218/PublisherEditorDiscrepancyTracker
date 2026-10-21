# ==============================================================================
# Multi-Stage Dockerfile: Taylor & Francis Publisher-Editor Discrepancy Tracker
# Architecture: Unified container serving React SPA + Node.js 24 SQLite REST API
# Base: Alpine Linux with Node.js 24 (native node:sqlite support)
# ==============================================================================

# ------------------------------------------------------------------------------
# Stage 1: Frontend Build
# ------------------------------------------------------------------------------
FROM node:24-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 2: Backend Build
# ------------------------------------------------------------------------------
FROM node:24-alpine AS backend-builder
WORKDIR /app/backend

COPY backend/package.json ./
RUN npm install

COPY backend/ ./
RUN npm run build

# ------------------------------------------------------------------------------
# Stage 3: Production Runtime
# ------------------------------------------------------------------------------
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000
ENV DATA_DIR=/app/backend/data
ENV DB_PATH=/app/backend/data/discrepancy_tracker.db
ENV UPLOADS_DIR=/app/backend/uploads

# Install production dependencies only
COPY backend/package.json ./backend/
RUN cd backend && npm install --omit=dev --ignore-scripts && npm cache clean --force

# Copy compiled backend distribution and schema
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY backend/src/db/schema.sql ./backend/src/db/schema.sql

# Copy compiled frontend distribution
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

# Setup persistent storage directories with non-root node user ownership
RUN mkdir -p /app/backend/data /app/backend/uploads && \
    chown -R node:node /app

VOLUME ["/app/backend/data", "/app/backend/uploads"]

USER node

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:5000/health || exit 1

CMD ["node", "backend/dist/index.js"]
