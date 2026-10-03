FROM node:20-slim

# Install OpenSSL untuk kebutuhan Prisma
RUN apt-get update -y && apt-get install -y openssl


WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

# Build dilakukan saat container berjalan (agar volume DB terbaca)
CMD ["sh", "-c", "npm run build && npm start"]
