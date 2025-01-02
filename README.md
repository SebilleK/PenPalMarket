# PenPal Market

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Fastify](https://img.shields.io/badge/fastify-%23000000.svg?style=for-the-badge&logo=fastify&logoColor=white)

## Project Description

**PenPal Market** is a full-stack eCommerce store designed to showcase a premium selection of pens as writing instruments. This project is a collaborative effort to build a complete online store experience, covering everything from ideation and UI/UX design to backend and frontend development. The store offers a carefully curated range of pens, catering to both practical users and luxury collectors.

To ensure simplicity and maintainability, we prioritize a minimalistic approach to dependencies, adhere to a Test-Driven Development (TDD) methodology, and maintain a well-organized project structure.

This document serves as a guide to all aspects of the project.

WIP.

## Quickstart

### Backend

**Navigate to the backend dir**

```bash
cd backend
```

**Run | dev** (no transpiling):

```bash
npm run start-ts
```

**Run | prod**:

```bash
npm run build
npm run start
```

## Tests

We utilize Fastify's built-in testing method, inject(), along with Node's native assertion and testing modules, to validate our backend API. We intend to use a TDD approach where we write tests before the actual implementation.

To run tests:

```bash
npm test
```

## Structure

### Folder Organization

**backend**

```bash
backend/
├── database/ # a starter schema (wip) and mock data for the api as needed
├── src/
│ ├── routes/ # route handlers (api endpoints) according to types
│ │ └── products.ts
│ │ └── ....
│ ├── services/ # services as needed
│ │ └── productService.ts
│ │ └── ....
│ ├── types/ # type definitions
│ │ └── product.ts
│ │ └── ....
│ └── app.ts # configuring the fastify instance, registering routes
│ └── index.ts # starting the server
├── tests # wip, all tests for the endpoints
├── package.json
└── tsconfig.json
```

### Database

#### Database Schema

Database Schema designed with https://dbdiagram.io/. Subject to changes.
![Database Schema](images/db_schema_first.png)
