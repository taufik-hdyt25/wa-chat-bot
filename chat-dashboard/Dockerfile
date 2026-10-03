FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npx prisma generate

# Build dilakukan saat container berjalan (agar volume DB terbaca)
CMD ["sh", "-c", "npm run build && npm start"]
