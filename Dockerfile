# Use the official Node.js image as the base
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Install necessary dependencies for Puppeteer
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set the Puppeteer environment variable to use system-installed Chrome
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the entire app to the container
COPY . .

# Build the Next.js app
RUN npm run build

# Install only production dependencies
RUN npm ci --omit=dev

# ---- Production Image ----
FROM node:18-alpine AS runner

# Set working directory
WORKDIR /app

# Install necessary dependencies for Puppeteer in the production container
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set Puppeteer to use system-installed Chrome
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copy only necessary files from the builder stage
COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules

# Set environment variable for production
ENV NODE_ENV=production
ENV PORT=8080

# Expose port for Cloud Run
EXPOSE 8080

# Start the Next.js application
CMD ["node", "node_modules/.bin/next", "start", "-p", "8080"]
