# PenPal Market

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Fastify](https://img.shields.io/badge/fastify-%23000000.svg?style=for-the-badge&logo=fastify&logoColor=white)

## Project Description

**PenPal Market** is a _full-stack eCommerce store_ designed to showcase a premium selection of pens as writing instruments. This project is a collaborative effort to build a **complete online store** experience, covering everything from _ideation and UI/UX design_ to _backend and frontend development_. The store offers a carefully curated range of pens, catering to both practical users and luxury collectors.

In pursuit of simplicity and maintainability, we prioritize a **minimalistic approach to dependencies**, adhere to a **Test-Driven Development** (TDD) methodology, and maintain a well-organized project structure grouped by **feature domains** — "products", "users" etc:. (as opposed to grouping technical layers together — "routes", "services", etc:.).

This document serves as a guide to all aspects of the project.

WIP.

## Quickstart

### Backend

---

#### Database Setup

There needs to be a **database setup** for this project. You can set it up / manage it with whatever software as you prefer, but below are some steps. To follow them, make sure you have downloaded and installed [MySQL](https://dev.mysql.com/downloads/installer/).

1. Open up a command line (as admin) and start MySQL Server

```bash
net start mysql
# net stop mysql # >>> to stop services
```

2. Log in to MySQL as the root user (or another), add "use mysql;" if need be

```bash
mysql -u root -p # use mysql;
```

2.5. (OPTIONAL) Manage the connection with either [MySQL Workbench](https://dev.mysql.com/downloads/installer/), the [Database Client JDBC](https://marketplace.visualstudio.com/items?itemName=cweijan.dbclient-jdbc) VSC extension, or other sofware of choice. Make sure to establish the connection with the right credentials: check the .example-env file.

**Defaults:**
**user**: _root_
**host:** _localhost_
**port:** _3306_

3. Create and Seed the database. Appropriate Queries are provided in database/utility. You can do _both_ of these things by running **fresh_db.sql**, or step by step:

   **3.1** Run **create_db.sql** to create the database

   **3.2** Seed it with the provided data with **seed_db.sql**

---

#### API Setup

On the project:

1. Navigate to the backend dir

```bash
cd backend
```

2. Start the API

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

We utilize Fastify's built-in testing method, [inject()](https://fastify.dev/docs/v1.14.x/Documentation/Testing/) — which injects fake http requests, along with Node's native assertion and testing modules, to validate our backend API. We intend to use a TDD approach where we write tests before the actual implementation.

**Please make sure you have seeded the database with fresh data all tests to pass!**

To drop the database, re-create it and seed with fresh data again use the query:
database/utility/**clean_db.sql**
(or do it manually)

To run tests:

```bash
npm run test
```

## Database

We're using a MySQL database and **MySQL2**, a modern and lightweight library, to interact with it.

When using Typescript + CRUD operations with MySQL2, the query result includes a ResultSetHeader with query metadata you should use.

Refer to the [official docs](https://sidorares.github.io/node-mysql2/docs/documentation/typescript-examples#resultsetheader) on ResultSetHeader.

Example — createProduct function on productService.ts

```bash
export const createProduct = async (product: Product): Promise<Product> => {
	# ...
	try {
		const [result] = await connection.promise().query<ResultSetHeader>(sql, [name, description, price, category, stock]);

		# ...

		return newProduct;
	} catch (err) {
		throw new Error(`Error creating product: ${err}`);
	}
};
```

#### Database Schema

Database Schema designed with https://dbdiagram.io/. Subject to changes.
![Database Schema](images/db_schema_first.png)

## Project Structure

### Folder Organization

**backend**

```bash
backend/
├── database/ # mock data, useful sql queries, db connection
├── src/
│ ├── products # all products related functionality
│ │ └── productRoutes.ts # route handler (api endpoints) according to type
│ │ └── productService.ts # services as needed
│ │ └── productTypes.ts # type definitions
│ │ └── ....
│ ├── .... # feature domains as needed
│ └── app.ts # configuring the fastify instance, registering routes
│ └── index.ts # starting the server
├── tests # wip, all tests for the endpoints
├── package.json
└── tsconfig.json
```
