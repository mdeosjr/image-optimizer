FROM node:23-alpine

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./
RUN npm install

COPY src/domain ./src/domain
COPY src/infrastructure ./src/infrastructure
COPY src/utils ./src/utils
COPY src/worker ./src/worker

RUN mkdir -p /tmp/uploads
RUN mkdir -p /optimized

ENV NODE_ENV=development
CMD ["npm", "run", "start:worker"]
