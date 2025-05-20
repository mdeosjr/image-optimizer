FROM node:23-alpine

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./
RUN npm install

COPY src/shared ./src/shared
COPY src/worker ./src/worker
COPY tmp /tmp
COPY optimized /optimized

ENV NODE_ENV=development
CMD ["npm", "run", "start:worker"]
