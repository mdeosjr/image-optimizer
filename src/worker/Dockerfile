FROM node:23-alpine

WORKDIR /app

COPY ../../package.json ../../package-lock.json ./
RUN npm install

COPY ../../tsconfig.json ./
COPY . ./

ENV NODE_ENV=development
CMD ["npm", "run", "start:worker"]
