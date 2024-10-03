FROM node:20

WORKDIR  /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 5000
EXPOSE 3001

CMD ["npm", "run", "devStart"]