# Practical 1 - Student Management REST API

A REST API for managing academic student records with Node.js, Express, and MySQL. It listens on port 3000 by default.

## Requirements

- Node.js 20 or newer
- MySQL 8.0 or newer

## Setup

1. Create the database and table by running `database/schema.sql` in MySQL Workbench or the MySQL command line.
2. Copy `.env.example` to `.env` and set your local MySQL username and password.
3. In this folder, install dependencies with `npm install`.
4. Start the API with `npm start` (or `npm run dev` while developing).
5. Check `GET http://localhost:3000/health`; a working DB returns `{"status":"ok","database":"connected"}`.

## Endpoints

| Method | Path | Purpose | Success |
| --- | --- | --- | --- |
| GET | `/api/students` | List all students | 200 |
| GET | `/api/students?department=Computer Science` | Filter by exact department | 200 |
| GET | `/api/students/:id` | Read one student | 200 |
| POST | `/api/students` | Create a student | 201 |
| PUT | `/api/students/:id` | Replace all student fields | 200 |
| PATCH | `/api/students/:id` | Update selected fields | 200 |
| DELETE | `/api/students/:id` | Delete a student | 200 |

### Student JSON

```json
{
  "name": "Shubham Jha",
  "email": "Shubhamv@example.edu",
  "department": "Computer Science",
  "semester": 4,
  "cgpa": 8.25
}
```

All five fields are required for POST and PUT. PATCH accepts one or more of those fields. Semester must be an integer from 1 to 12; CGPA must be from 0 to 10. Email addresses are stored in lowercase and must be unique. Invalid input returns 400, duplicate email returns 409, and a missing student returns 404. SQL values are parameterized.

Import `postman/student-management.postman_collection.json` into Postman. Its requests use `http://localhost:3000` and an `studentId` collection variable (default `1`); create a record first and update the variable to its returned ID.
