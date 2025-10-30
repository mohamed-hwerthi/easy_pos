# ===== Build stage =====
FROM node:18-alpine AS builder
WORKDIR /app

# Accept build arguments
ARG VITE_API_BASE_URL
ARG VITE_API_UPLOADS_URL

# Set environment variables for the build
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_UPLOADS_URL=$VITE_API_UPLOADS_URL

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and environment files
COPY . .
COPY .env.production .env.production

# Build Vite app with production mode
RUN npm run build

# ===== Production stage =====
FROM nginx:stable-alpine

# Remove default Nginx site
RUN rm -rf /usr/share/nginx/html/*

# Copy built app from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]