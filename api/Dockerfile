# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app
 
COPY package*.json ./
 
RUN npm install
 
COPY . .
 
RUN npm run build 

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy built assets from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

# Make sure these directories exist for uploads
RUN mkdir -p uploads && \
chmod 777 /app/uploads
 
ENV PATH=/app/node_modules/.bin:$PATH
 
EXPOSE 4000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "fetch('http://localhost:4000/health').then(r => process.exit(r.ok ? 0 : 1))"
 
CMD ["node", "dist/index.js"] 