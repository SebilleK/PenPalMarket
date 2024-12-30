# PenPal Market

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Fastify](https://img.shields.io/badge/fastify-%23000000.svg?style=for-the-badge&logo=fastify&logoColor=white)

## Project Description

**PenPal Market** is a full-stack eCommerce store designed to showcase a premium selection of pens as writing instruments. This project is a collaborative effort to build a complete online store experience, covering everything from ideation and UI/UX design to backend and frontend development. The store offers a carefully curated range of pens, catering to both practical users and luxury collectors.

This document serves as a guide to all aspects of the project.

WIP.

## Quickstart

### Backend

**Run | dev** (no transpiling):

```bash
npm run start-ts
```

**Run | prod**:

```bash
npm run build
npm run start
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
│ └── index.ts # server setup and initialization
├── package.json
└── tsconfig.json
```

### Database

#### Database Schema

Database Schema designed with https://dbdiagram.io/. Subject to changes.
![Database Schema](images/db_schema_first.png)
