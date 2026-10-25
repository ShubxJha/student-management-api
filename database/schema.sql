CREATE DATABASE IF NOT EXISTS student_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

USE student_management;

CREATE TABLE IF NOT EXISTS students (
  student_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(254) NOT NULL,
  department VARCHAR(120) NOT NULL,
  semester TINYINT UNSIGNED NOT NULL,
  cgpa DECIMAL(3,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (student_id),
  CONSTRAINT uq_students_email UNIQUE (email),
  CONSTRAINT chk_students_semester CHECK (semester BETWEEN 1 AND 12),
  CONSTRAINT chk_students_cgpa CHECK (cgpa BETWEEN 0.00 AND 10.00),
  INDEX idx_students_department (department)
);

select * from students
