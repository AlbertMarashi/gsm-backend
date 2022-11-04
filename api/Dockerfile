FROM node:14-alpine

WORKDIR /backend

COPY . .

RUN npm i
RUN npm i -g nodemon

EXPOSE 80 443

CMD sh ./start