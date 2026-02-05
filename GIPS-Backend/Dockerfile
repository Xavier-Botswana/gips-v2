FROM node:18

WORKDIR /app

COPY package.json ./

# Clear npm cache
RUN npm cache clean --force

RUN npm install

COPY . .

EXPOSE 8000

CMD [ "npm", "run", "start:prod" ]
