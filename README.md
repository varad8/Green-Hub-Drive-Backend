  <div align="center">
  <h1 align="center">Green Hub Drive Backend + Server</h1>
  <h3>Codebase for the Green Hub Drive Backend + Server platform</h3>
  <h3>◦ Developed with the software and tools below.</h3>
  <p align="center"><img src="https://img.shields.io/badge/-Node.js-004E89?logo=Node.js&style=flat" alt='Node.js\' />
<img src="https://via.placeholder.com/1/0000/00000000" alt="spacer" /><img src="https://img.shields.io/badge/-Express.js-004E89?logo=Express.js&style=flat" alt='Express.js\' />
<img src="https://via.placeholder.com/1/0000/00000000" alt="spacer" /><img src="https://img.shields.io/badge/-MySQL-004E89?logo=MySQL&style=flat" alt='MySQL\' />
<img src="https://via.placeholder.com/1/0000/00000000" alt="spacer" /><img src="https://img.shields.io/badge/-EJS-004E89?logo=EJS&style=flat" alt='EJS\' />
<img src="https://via.placeholder.com/1/0000/00000000" alt="spacer" /><img src="https://img.shields.io/badge/-Multer-004E89?logo=Multer&style=flat" alt='Multer\' />
<img src="https://via.placeholder.com/1/0000/00000000" alt="spacer" /><img src="https://img.shields.io/badge/-Razorpay-004E89?logo=Razorpay&style=flat" alt='Razorpay"' />
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

This is a Node.js project with a comprehensive 1 liner summary of the code. The project involves building an EV charging station management system, with a focus on user authentication, booking, and payment processing. The project uses Express.js for routing, MongoDB for data storage, and React for front-end development. The project also includes a RESTful API for interacting with the backend, as well as a web interface for users to access the system.

---

## 🌟 Features

Here is a list of features for the project:<br>

- User authentication (login, logout, registration)
- Booking system (create, read, update, delete)
- Payment processing (credit card, PayPal)
- RESTful API for interacting with the backend
- Web interface for users to access the system
- MongoDB for data storage
- Express.js for routing
- React for front-end development

---

## 📁 Repository Structure

```sh
├── .env
├── city.json
├── controllers
│   ├── admin
│   │   ├── auth.js
│   │   ├── booking.js
│   │   ├── dependencies.js
│   │   ├── notification.js
│   │   ├── passwordReset.js
│   │   ├── rating.js
│   │   └── reset-password.html
│   ├── superadmin
│   │   ├── approve.js
│   │   ├── auth.js
│   │   ├── chartData.js
│   │   └── dependencies.js
│   └── user
│       ├── auth.js
│       ├── booking.js
│       ├── dependencies.js
│       ├── imageController.js
│       ├── notification.js
│       ├── passwordReset.js
│       ├── paymentController.js
│       ├── rating.js
│       └── reset-password.html
├── db
│   ├── d.json
│   ├── db.js
│   └── sql
│       ├── booking.sql
│       ├── evadmin.sql
│       ├── notification.sql
│       ├── rating.sql
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
    ├── 1709900009285_user.png
    ├── 1709900017107_AdobeStock_585977851.jpg
    ├── 1709901339652_user.png
    ├── 1709901673376_evstation.png
    ├── 1709901687799_editors_images_1665045694755-EV-Station-PluZ-2-660x400@2x.jpg
    ├── 1709901704658_logo.png
    ├── 1709901997678_profile.png
    ├── 1709902026668_pexels-photo-9800006.jpeg
    ├── 1709902464922_evstation.png
    └── 1709902487377_Untitled-design-2023-06-21T142313.086.jpg

```

---

## 💻 Code Summary

<details><summary>\controllers\admin</summary>

| File             | Summary                                                                                                                                                                                                                                                                                                             |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| auth.js          | The code defines a set of functions for managing EV station profiles, including registering and logging in EV admins, updating their profiles, and retrieving their profile information. The code also includes functions for uploading and deleting profile pictures, as well as updating the station's image URL. |
| booking.js       | The code defines a set of functions for managing bookings, including getting booking data by station ID, updating booking status and visiting status, visualizing chart data, getting payment data by user ID, and getting counting data.                                                                           |
| dependencies.js  | The code defines a module that exports various dependencies and functions for use in an Express.js application, including the ability to hash passwords, generate unique EV IDs, check user and EV admin existence, and send emails using Nodemailer.                                                               |
| notification.js  | The code defines a set of functions for sending, retrieving, updating, and deleting notifications in a database. The primary function of the code is to provide a set of APIs for managing notifications in a web application.                                                                                      |
| passwordReset.js | The code defines a set of functions for handling password resets, including generating and sending reset emails, storing and validating reset tokens in a database, and resetting user passwords.                                                                                                                   |
| rating.js        | The code retrieves ratings for a specific station ID from a database using a connection pool.                                                                                                                                                                                                                       |

</details>

---

<details><summary>\controllers\superadmin</summary>

| File            | Summary                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| approve.js      | The code defines two functions: `updateEvAccountStatus` and `disapproveEvAccountStatus`, which are used to update the account status of an EV station in a database. The functions take in request parameters, check if the station and admin exist, fetch the EV station profile details, and then update the account status in the database.                                                                                                                                                 |
| auth.js         | The code defines a set of functions for managing user profiles, including registering and logging in as a super admin, updating and retrieving profile information, and uploading and retrieving profile images.                                                                                                                                                                                                                                                                               |
| chartData.js    | The code defines three functions: `getChartOfBookingData`, `getAllBookingPaymentData`, and `getBookingCounts`. The primary function of the code is to provide data for a chart that displays bookings by station and month-year, as well as aggregated data for all bookings with payment details and EV titles. Additionally, the code provides functions to get the number of bookings for today, not visited, and visited, as well as a function to get the month name from a month number. |
| dependencies.js | The code defines a module that exports various functions and variables related to authentication, including checking the existence of users in different tables, generating unique IDs, and sending emails using Nodemailer.                                                                                                                                                                                                                                                                   |

</details>

---

<details><summary>\controllers\user</summary>

| File                 | Summary                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| auth.js              | The code defines a set of functions for user registration, login, profile management, and EV station management. The primary function of the code is to provide a set of APIs for managing user accounts and EV stations, including user registration, login, profile creation and update, and EV station creation and retrieval.                                                                                                                                                                                                                                                                                              |
| booking.js           | The code is a Node.js module that exports several functions related to checking slot availability and booking data for an electric vehicle (EV) charging station. The primary function of the code is to check if a given slot is available for a specific date, time, and duration based on the operating hours of the station and any existing bookings. Additionally, the code provides functions to get booking data by user ID, station ID, or booking ID, as well as a function to generate time suggestions for a given date, slot, and duration based on the operating hours of the station and any existing bookings. |
| dependencies.js      | The code defines a set of functions and exports them as an object, with the primary function being to provide a set of utilities for working with Express.js, including database queries, password hashing, email sending, and file uploading.                                                                                                                                                                                                                                                                                                                                                                                 |
| imageController.js   | The code defines a function called `uploadImage` that takes a request and response object as arguments, and uses the `multer` middleware to handle file uploads. It sets up storage for the uploaded files in the `./uploads/` directory, limits the file size to 1MB, and checks the file type to ensure it is an image (JPEG, JPG, PNG, or GIF). If the file is valid, it returns the URL of the uploaded file in the response.                                                                                                                                                                                              |
| notification.js      | The code defines three functions: `getAllNotification`, `getNotificationByUserId`, and `sendEmailMessage`. The first two functions are used to retrieve notifications and a specific notification by user ID, respectively. The third function is used to send an email to an administrator with the contact details of a user who has submitted a message through the application.                                                                                                                                                                                                                                            |
| passwordReset.js     | The code defines a set of functions for handling password resets, including generating and sending reset links, storing and validating reset tokens in a database, and resetting passwords.                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| paymentController.js | The code defines a set of functions for creating an order, fetching payments for an order, saving bookings, and sending invoices via email.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| rating.js            | The code defines a set of functions for managing ratings, including saving, updating, and retrieving ratings. The primary function of the code is to provide a set of APIs for interacting with the rating data in a database.                                                                                                                                                                                                                                                                                                                                                                                                 |

</details>

---

<details><summary>\db</summary>

| File  | Summary                                                                                                                     |
| ----- | --------------------------------------------------------------------------------------------------------------------------- |
| db.js | The code defines a MySQL connection pool using the `mysql` module and exports it for use in other parts of the application. |

</details>

---

<details><summary>\router</summary>

| File                | Summary                                                                                                                                                                                                                                                                                   |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| adminRouter.js      | The code defines a router for an Express.js application that handles various administrative tasks, including user registration and login, profile management, image uploading, notification sending, booking management, rating retrieval, and visualization of booking and payment data. |
| superadminRouter.js | The code defines routes for a superadmin dashboard, including registration, login, profile management, and chart data retrieval.                                                                                                                                                          |
| userRouter.js       | The code defines a router for an Express.js application that handles various user-related requests, including registration, login, profile management, booking, and payment. It also includes routes for retrieving notifications, ev stations, ratings, and chart data.                  |

</details>

---

<details><summary>Root</summary>

| File      | Summary                                                                                           |
| --------- | ------------------------------------------------------------------------------------------------- |
| server.js | The code defines an Express.js server that serves JSON data from a file and listens on port 3000. |

</details>

---

## 🚀 Getting Started

To get started with this project, follow these steps:<br>

1. Install the necessary dependencies by running `npm install` in your terminal.
2. Create a `.env` file in the root directory of the project and add your environment variables (e.g., database credentials, API keys, etc.).
3. Start the server by running `npm run dev` or `nodemon server.js`.
4. Navigate to `http://localhost:3000` in your web browser to access the web interface.
5. Use the RESTful API endpoints to interact with the backend.
6. Use the front-end development tools (e.g., React) to build the user interface.
7. Test the application thoroughly to ensure it is working as expected.

Note: This guide assumes you have Node.js and npm installed on your system. If you don't have them, you can download them from the official websites.

---

Generated with ❤️ by [ReadMeAI](https://www.readmeai.co/).
