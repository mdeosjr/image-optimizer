FROM node:23-alpine

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./
RUN npm install

COPY src/domain ./src/domain
COPY src/infrastructure ./src/infrastructure
COPY src/utils ./src/utils
COPY src/api ./src/api

RUN mkdir -p /tmp/uploads
RUN mkdir -p /optimized

ENV NODE_ENV=development
EXPOSE 3000
CMD ["npm", "run", "start:api"]
