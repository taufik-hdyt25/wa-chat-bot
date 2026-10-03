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

# Jalankan bot
CMD ["npm", "run", "dev"]
