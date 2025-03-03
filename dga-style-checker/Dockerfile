# Use the official Node.js image as the base
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json from the correct directory
COPY dga-style-checker/package.json dga-style-checker/package-lock.json ./

# Install dependencies
RUN npm install

# Copy the entire app from the correct directory
COPY dga-style-checker/. .

# Build the Next.js app
RUN npm run build

# Install only production dependencies
RUN npm ci --omit=dev

# ---- Production Image ----
FROM node:18-alpine AS runner

# Set working directory
WORKDIR /app

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
