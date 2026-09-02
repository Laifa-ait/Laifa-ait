# Stage 1: Build stage
FROM node:22-alpine AS builder
WORKDIR /app

# Upgrade OS packages & npm to eliminate base image vulnerabilities
RUN apk upgrade --no-cache && npm install -g npm@latest

# Client build arguments and environment defaults
ARG VITE_FIREBASE_PROJECT_ID=ai-studio-217f6d79-c758-4e14-845d-737228cd3915
ARG VITE_FIREBASE_AUTH_DOMAIN=ai-studio-217f6d79-c758-4e14-845d-737228cd3915.firebaseapp.com
ARG VITE_FIREBASE_API_KEY=AIzaSyCsGYo1B0vavSQbKdFvu0-7jfzILFHvejA
ARG VITE_FIREBASE_APP_ID=1:76420360525:web:d6781ea77ef0c2257aef04
ARG VITE_FIREBASE_STORAGE_BUCKET=ai-studio-217f6d79-c758-4e14-845d-737228cd3915.firebasestorage.app
ARG VITE_FIREBASE_MESSAGING_SENDER_ID=76420360525
ARG VITE_FIREBASE_MEASUREMENT_ID=G-XQW5YY2C36
ARG VITE_FIREBASE_DATABASE_ID=ai-studio-217f6d79-c758-4e14-845d-737228cd3915
ARG FIREBASE_DATABASE_ID=ai-studio-217f6d79-c758-4e14-845d-737228cd3915

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

# Upgrade OS packages & npm to eliminate base image vulnerabilities
RUN apk upgrade --no-cache && npm install -g npm@latest

ENV NODE_ENV=production
ENV PORT=8080
ENV FIREBASE_DATABASE_ID=ai-studio-217f6d79-c758-4e14-845d-737228cd3915
ENV VITE_FIREBASE_DATABASE_ID=ai-studio-217f6d79-c758-4e14-845d-737228cd3915

# Copy package files and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy built assets and assets required at runtime from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/server.ts ./server.ts

# Set non-root user
USER node

# Expose port 8080 for Cloud Run
EXPOSE 8080

# Start the application
CMD ["npm", "start"]
