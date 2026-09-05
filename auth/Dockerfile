FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY src ./src
# ต้องมีด้วย เพราะ service รัน migration เองตอนบูต
COPY migrations ./migrations
ENV PORT=3001
EXPOSE 3001
CMD ["node", "src/server.mjs"]
