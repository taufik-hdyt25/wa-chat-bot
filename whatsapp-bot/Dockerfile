FROM node:20-slim

# Install OpenSSL untuk kebutuhan Prisma
RUN apt-get update -y && apt-get install -y openssl


WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Jalankan migrasi DB lalu jalankan bot
CMD ["sh", "-c", "npx prisma db push && npm run dev"]
