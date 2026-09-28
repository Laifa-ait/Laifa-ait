# Stage 1: Build stage
FROM node:22-alpine AS builder
WORKDIR /app

# Upgrade OS packages
RUN apk upgrade --no-cache

# Client build arguments and environment variables (injected at build time by CI/CD)
ARG VITE_FIREBASE_PROJECT_ID
ARG VITE_FIREBASE_AUTH_DOMAIN
ARG VITE_FIREBASE_API_KEY
ARG VITE_FIREBASE_APP_ID
ARG VITE_FIREBASE_STORAGE_BUCKET
ARG VITE_FIREBASE_MESSAGING_SENDER_ID
ARG VITE_FIREBASE_MEASUREMENT_ID
ARG VITE_FIREBASE_DATABASE_ID
ARG FIREBASE_DATABASE_ID

ENV VITE_FIREBASE_PROJECT_ID=$VITE_FIREBASE_PROJECT_ID
ENV VITE_FIREBASE_AUTH_DOMAIN=$VITE_FIREBASE_AUTH_DOMAIN
ENV VITE_FIREBASE_API_KEY=$VITE_FIREBASE_API_KEY
ENV VITE_FIREBASE_APP_ID=$VITE_FIREBASE_APP_ID
ENV VITE_FIREBASE_STORAGE_BUCKET=$VITE_FIREBASE_STORAGE_BUCKET
ENV VITE_FIREBASE_MESSAGING_SENDER_ID=$VITE_FIREBASE_MESSAGING_SENDER_ID
ENV VITE_FIREBASE_MEASUREMENT_ID=$VITE_FIREBASE_MEASUREMENT_ID
ENV VITE_FIREBASE_DATABASE_ID=$VITE_FIREBASE_DATABASE_ID
ENV FIREBASE_DATABASE_ID=$FIREBASE_DATABASE_ID

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application files
COPY . .

# Run build
RUN npm run build

# Stage 2: Production stage
FROM node:22-alpine AS runner
WORKDIR /app

# Upgrade OS packages to eliminate base image vulnerabilities
RUN apk upgrade --no-cache

ENV NODE_ENV=production
ENV PORT=8080
# CSRF_SECRET and other secrets must be provided at runtime via GCP Secret Manager / Cloud Run environment

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && \
    rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx /opt/yarn* /usr/local/bin/yarn* /usr/local/lib/node_modules/corepack /usr/local/bin/corepack /root/.npm

# Copy built assets and assets required at runtime from builder with node ownership
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --from=builder --chown=node:node /app/public ./public
COPY --from=builder --chown=node:node /app/server.ts ./server.ts

# Set non-root user
USER node

# Expose port 8080 and 3000 for Cloud Run ingress and internal compatibility
EXPOSE 8080 3000

# Start the application directly with node (avoids PID 1 signal forwarding issues and npm overhead)
CMD ["node", "dist/server.cjs"]
