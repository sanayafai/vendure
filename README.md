# Vendure

A headless [GraphQL](https://graphql.org/) ecommerce framework built on [Node.js](https://nodejs.org) with [Nest](https://nestjs.com/) with [TypeScript](http://www.typescriptlang.org/).

[![Build Status](https://travis-ci.org/vendure-ecommerce/vendure.svg?branch=master)](https://travis-ci.org/vendure-ecommerce/vendure) [![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lernajs.io/)

### [www.vendure.io](https://www.vendure.io/)

## Structure

This project is a monorepo managed with [Lerna](https://github.com/lerna/lerna). Several npm packages are published from this repo, which can be found in the `packages/` directory.

```
vendure/
├── admin-ui/       # Source of the admin ui app (an Angular CLI project)
├── docs/           # Documentation source
├── packages/       # Source for the Vendure server & plugin packages
├── scripts/
    ├── codegen/    # Scripts used to generate TypeScript code from the GraphQL APIs
    ├── docs/       # Scripts used to generate documentation markdown from the source
```

## Development

### 1. Install top-level dependencies

`yarn`

The root directory has a `package.json` which contains build-related dependencies for tasks including:

* Building & deploying the docs 
* Generating TypeScript types from the GraphQL schema
* Linting, formatting & testing tasks to run on git commit & push

### 2. Bootstrap the packages

`yarn bootstrap`

This runs the Lerna "bootstrap" command, which installs dependencies for all packages.

### 2. Set up the server

The server requires an SQL database to be available. I am currently using [bitnami-docker-phpmyadmin](https://github.com/bitnami/bitnami-docker-phpmyadmin) Docker image,
which is MariaDB including phpMyAdmin. However, the simplest option is to use SQLite.

Vendure uses [TypeORM](http://typeorm.io), so it compatible will any database which works with TypeORM.

1. Configure the [dev config](./packages/dev-server/dev-config.ts)
2. Create the database using your DB admin tool of choice (e.g. phpMyAdmin if you are using the docker image suggested above). Name it according to the config ("vendure-dev").
3. Populate mock data with `yarn dev-server:populate`
4. `yarn dev-server` to start the server

### 3. Set up the admin ui

1. `cd admin-ui && yarn`
2. `yarn start`
3. Go to http://localhost:4200 and log in with "superadmin", "superadmin"

### Code generation

[graphql-code-generator](https://github.com/dotansimha/graphql-code-generator) is used to automatically create TypeScript interfaces
for all GraphQL server operations and admin ui queries. These generated interfaces are used in both the admin ui and the server.

Run `yarn codegen` to generate TypeScript interfaces based on these queries. The generated
types are located at [`packages/common/src/generated-types.ts`](./packages/common/src/generated-types.ts) & [`packages/common/src/generated-shop-types.ts`](./packages/common/src/generated-shop-types.ts).

### Testing

#### Server Unit Tests

The server has unit tests which are run with `yarn test:common` and `yarn test:core`.

Unit tests are co-located with the files which they test, and have the suffix `.spec.ts`.

#### Server e2e Tests

The server has e2e tests which test the API with real http calls and against a real Sqlite database powered by [sql.js](https://github.com/kripken/sql.js/). 
The tests are run with `yarn test:e2e`

The e2e tests are located in [`/packages/core/e2e`](./packages/core/e2e). Each test suite (file) has the suffix `.e2e-spec.ts`. The first time the e2e tests are run,
sqlite files will be generated in the `__data__` directory. These files are used to speed up subsequent runs of the e2e tests. They can be freely deleted
and will be re-created the next time the e2e tests are run.

#### Admin UI Unit Tests

The Admin UI has unit tests which are run with `yarn test:admin-ui`.

Unit tests are co-located with the files which they test, and have the suffix `.spec.ts`.

## User Guide

### Localization

Vendure server will detect the most suitable locale based on the `Accept-Language` header of the client.
This can be overridden by appending a `lang` query parameter to the url (e.g. `http://localhost:3000/api?lang=de`). 

All locales in Vendure are represented by 2-character [ISO 639-1 language codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes).

Translations for localized strings are located in the [i18n/messages](./packages/core/src/i18n/messages) directory.

### Errors

All errors thrown by the Vendure server can be found in the [errors.ts file](./packages/core/src/common/error/errors.ts). 

All errors extend from `I18nError`, which means that the error messages are localized as described above. Each error type
has a distinct code which can be used by the front-end client in order to correctly handle the error.

### Orders Process

The orders process is governed by a finite state machine which allows each Order to transition only from one valid state
to another, as defined by the [OrderState definitions](packages/core/src/service/helpers/order-state-machine/order-state.ts):

```TypeScript
export type OrderState =
    | 'AddingItems'
    | 'ArrangingPayment'
    | 'PaymentAuthorized'
    | 'PaymentSettled'
    | 'OrderComplete'
    | 'Cancelled';
```

This process can augmented with extra states according to the needs of the business, and these states are defined
in the `orderProcessOptions` property of the VendureConfig object which is used to bootstrap Vendure. Additional
logic can also be defined which will be executed on transition from one state to another.

## License

MIT
