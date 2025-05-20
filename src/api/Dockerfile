FROM node:23-alpine

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./
RUN npm install

COPY src/shared ./src/shared
COPY src/api ./src/api
COPY tmp /tmp
COPY optimized /optimized

ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "start:api"]
