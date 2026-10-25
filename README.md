# M3_P1 - Student Management REST API

This project implements the Module 3 Practical 1 student management REST API using Node.js, Express, and MySQL. The project folder is `D:\TPDS Projects\M3_P1`, and the API listens on port 3000 by default.

## Requirements

- Node.js 20 or newer
- MySQL 8.0 or newer

## Setup

1. Open PowerShell or Command Prompt and go to the project folder:

   ```powershell
   cd "D:\TPDS Projects\M3_P1"
   ```

2. Create the database and table by running `database/schema.sql` in MySQL Workbench or the MySQL command line.
3. Copy `.env.example` to `.env` and set your local MySQL username and password.
4. Install the Node.js dependencies:

   ```powershell
   npm install
   ```

5. Start the API:

   ```powershell
   npm start
   ```

   For development with automatic restart, use `npm run dev` instead.

6. Keep the terminal open and send `GET http://localhost:3000/health` in Postman. A connected database returns `{"status":"ok","database":"connected"}`.

## Postman

Import `postman/student-management.postman_collection.json` into Postman. The collection uses `http://localhost:3000` and saves the ID after a successful **Create student** request. Run **Create student** before **Get student**, **Update student**, **Update CGPA**, or **Delete student**.

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
  "name": "Aarav Mehta",
  "email": "aarav@example.edu",
  "department": "Computer Science",
  "semester": 4,
  "cgpa": 8.25
}
```

All five fields are required for POST and PUT. PATCH accepts one or more of those fields. Semester must be an integer from 1 to 12; CGPA must be from 0 to 10. Email addresses are stored in lowercase and must be unique. Invalid input returns 400, duplicate email returns 409, and a missing student returns 404. SQL values are parameterized.
