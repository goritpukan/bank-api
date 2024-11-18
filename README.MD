# NestJS bank api

## General info

This is FICE dev department (backend) test task.

## Technologies

* Programing language: JS/TS
* Framework: NestJS
* Swagger
* Database: PostgreSQL
* ORM: Prisma
* Accurate calculations: Decimal.js
* Jest testing
* Axios
* class-transformer and class-validator for DTO

## Third-party APIs

* https://app.exchangerate-api.com/

## Before setup

* Install nodejs
* Host PostgreSQL db (docker, render, etc.)
* Get Api key here: https://app.exchangerate-api.com/

## .env setup

```
touch .env
```

.env

```dotenv
# Example of .env file
DATABASE_URL="your DB url"
JWT_SECRET="secret"
CURRENCY_API_KEY="api key, that you can get here: https://app.exchangerate-api.com/"
```

## App setup

```
npm i
npm run build 
```

## Prisma setup

```
npx prisma init
npx prisma migrate dev --name init
```

## Run app

```
npm run start:prod
```
## Swagger url
http://localhost:3000/api
