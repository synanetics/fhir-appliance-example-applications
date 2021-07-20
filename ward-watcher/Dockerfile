FROM node:14.17.0-alpine3.13

RUN mkdir /app
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --production

COPY . .

CMD ["npm", "start"]