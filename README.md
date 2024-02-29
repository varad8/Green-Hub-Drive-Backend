  <div align="center">
  <h1 align="center">Green Hub Drive Serve</h1>
  <h3>Codebase for the Green Hub Drive Serve platform</h3>
  <h3>◦ Developed with the software and tools below.</h3>
  <p align="center"><img src="https://img.shields.io/badge/-Node.js-004E89?logo=Node.js&style=flat-square" alt='Node.js\' />
<img src="https://via.placeholder.com/1/0000/00000000" alt="spacer" /><img src="https://img.shields.io/badge/-Express.js-004E89?logo=Express.js&style=flat-square" alt='Express.js\' />
<img src="https://via.placeholder.com/1/0000/00000000" alt="spacer" /><img src="https://img.shields.io/badge/-MySQL-004E89?logo=MySQL&style=flat-square" alt='MySQL\' />
<img src="https://via.placeholder.com/1/0000/00000000" alt="spacer" /><img src="https://img.shields.io/badge/-dotenv-004E89?logo=dotenv&style=flat-square" alt='dotenv\' />
<img src="https://via.placeholder.com/1/0000/00000000" alt="spacer" /><img src="https://img.shields.io/badge/-bcrypt-004E89?logo=bcrypt&style=flat-square" alt='bcrypt\' />
<img src="https://via.placeholder.com/1/0000/00000000" alt="spacer" /><img src="https://img.shields.io/badge/-moment-004E89?logo=moment&style=flat-square" alt='moment"' />
<img src="https://via.placeholder.com/1/0000/00000000" alt="spacer" />
  </p>
  </div>
  
  ---
  ## 📚 Table of Contents
  - [📚 Table of Contents](#-table-of-contents)
  - [🔍 Overview](#-overview)
  - [🌟 Features](#-features)
  - [📁 Repository Structure](#-repository-structure)
  - [💻 Code Summary](#-code-summary)
  - [🚀 Getting Started](#-getting-started)
  
  ---
  
  
  ## 🔍 Overview

This is a Node.js project with a RESTful API, using Express.js as the web framework and MongoDB as the database. The project has a modular structure, with separate folders for controllers, routers, and models. The code is well-organized and follows best practices for coding conventions and error handling.

---

## 🌟 Features

Here is a list of features of the project, based on the information provided:<br>

- RESTful API using Express.js
- Modular structure with separate folders for controllers, routers, and models
- MongoDB as the database
- Error handling and best practices for coding conventions
- Support for image uploads
- Support for WhatsApp notifications
- Support for booking system
- Support for payment system
- Support for admin and superadmin roles
- Support for user authentication and authorization
- Support for dependency injection
- Support for environment variables
- Support for SQL queries
- Support for JSON data storage
- Support for package management using npm
- Support for continuous integration and deployment using GitHub Actions

---

## 📁 Repository Structure

```sh
├── .env
├── controllers
│   ├── admin
│   │   ├── auth.js
│   │   ├── dependencies.js
│   │   └── notification.js
│   ├── superadmin
│   │   └── auth.js
│   └── user
│       ├── auth.js
│       ├── booking.js
│       ├── dependencies.js
│       ├── imageController.js
│       ├── notification.js
│       └── paymentController.js
├── db
│   ├── d.json
│   ├── db.js
│   └── sql
│       ├── booking.sql
│       ├── evadmin.sql
│       ├── notification.sql
│       ├── superadmin.sql
│       └── user.sql
├── package-lock.json
├── package.json
├── README.md
├── router
│   ├── adminRouter.js
│   ├── superadminRouter.js
│   └── userRouter.js
├── server.js
└── uploads
    ├── WhatsApp Image 2024-02-27 at 11.47.54 AM (1)-1709129110097.jpeg
    └── WhatsApp Image 2024-02-27 at 11.47.54 AM-1709130764121.jpeg

```

---

## 💻 Code Summary

<details><summary>\controllers\admin</summary>

| File            | Summary                                                                                                                                                                                                                                      |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| auth.js         | The code defines a set of functions for managing EV (Electric Vehicle) admin profiles, including registration, login, profile update, and image upload/download.                                                                             |
| dependencies.js | The code defines a module that exports various dependencies and functions for use in an Express.js application, including the ability to hash passwords, generate unique EV IDs, check user and EV admin existence, and handle file uploads. |
| notification.js | The code defines a set of functions for sending, retrieving, updating, and deleting notifications in a database.                                                                                                                             |

</details>

---

<details><summary>\controllers\superadmin</summary>

| File    | Summary                                                                                                |
| ------- | ------------------------------------------------------------------------------------------------------ |
| auth.js | The code defines a route for inserting a new superadmin into the database, using Express.js and MySQL. |

</details>

---

<details><summary>\controllers\user</summary>

| File                 | Summary                                                                                                                                                                                                                                                                                                                                                                                       |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| auth.js              | The code defines a set of functions for user registration, login, profile management, and file uploading and downloading.                                                                                                                                                                                                                                                                     |
| booking.js           | The code defines a function called `checkSlotAvailability` that takes in a request and response object as arguments, and queries a database to retrieve information about EV charging stations and bookings. It then generates time suggestions for each station based on the selected date, slot, and hours, and returns the results in a JSON format.                                       |
| dependencies.js      | The code defines a module that exports various dependencies and functions for use in an Express.js application, including the ability to check if a user exists in a database, hash passwords using bcrypt, and handle file uploads using multer.                                                                                                                                             |
| imageController.js   | The code defines a function called `uploadImage` that handles file uploads using the Multer middleware. It sets up storage and limits for the upload, checks the file type, and returns the uploaded image URL.                                                                                                                                                                               |
| notification.js      | The code defines two functions: `getAllNotification` and `getNotificationByUserId`. The former retrieves all notifications for a given user ID, while the latter retrieves a specific notification by its ID. Both functions use a MySQL database connection pool to execute SQL queries.                                                                                                     |
| paymentController.js | The code defines a function called `createOrder` that creates an order on the Razorpay payment gateway using the `Razorpay` library. It takes in a request object and a response object, and uses the `razorpayInstance` to create an order with the specified amount, currency, receipt, and other details. If successful, it sends a response with the order ID, amount, and other details. |

</details>

---

<details><summary>\db</summary>

| File  | Summary                                                                                                                     |
| ----- | --------------------------------------------------------------------------------------------------------------------------- |
| db.js | The code defines a MySQL connection pool using the `mysql` module and exports it for use in other parts of the application. |

</details>

---

<details><summary>\router</summary>

| File                | Summary                                                                                                                                                                                                                                                                 |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| adminRouter.js      | The code defines an Express.js router for an admin dashboard, with routes for user registration, login, profile management, image uploading, and notification sending.                                                                                                  |
| superadminRouter.js | The code defines a router for the superadmin functionality, with two routes: one for the home page and another for admin management.                                                                                                                                    |
| userRouter.js       | The code defines a router for user-related endpoints using Express.js, including routes for user registration, login, profile updates, and image uploading. It also includes routes for checking slot availability, getting notifications, and deleting profile images. |

</details>

---

<details><summary>Root</summary>

| File      | Summary                                                                                                                                   |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| server.js | The code sets up an Express.js server, imports routers for user, admin, and superadmin routes, and starts the server on a specified port. |

</details>

---

## 🚀 Getting Started

Getting Started with the Project<br>=====================================

This guide will help you get started with the project, including setting up the development environment and running the application.

1. Install Node.js and npm

---

To run this project, you need to have Node.js and npm installed on your system. You can download the latest version of Node.js from <https://nodejs.org/en/download/>. Once you have downloaded and installed Node.js, open a terminal or command prompt and run the following command to install npm:

```
npm install -g npm@latest
```

2. Clone the repository

---

Clone the repository using the following command:

```
git clone https://github.com/<username>/server.git
```

Replace `<username>` with your GitHub username.

3. Install dependencies

---

Navigate to the project directory and run the following command to install the dependencies:

```
npm install
```

4. Set up the environment variables

---

Create a new file called `.env` in the root directory of the project and add the following lines:

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=password
DB_NAME=database_name
```

Replace `localhost`, `root`, `password`, and `database_name`

---

Generated with ❤️ by [ReadMeAI](https://www.readmeai.co/).
