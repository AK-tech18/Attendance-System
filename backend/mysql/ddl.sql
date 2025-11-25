-- ============================
-- attendance_db schema
-- Clean + safe to re-run
-- ============================

CREATE DATABASE IF NOT EXISTS attendance_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE attendance_db;

-- ============================
-- Departments
-- ============================
CREATE TABLE IF NOT EXISTS departments (
  id   INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(32)  NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL
);

-- ============================
-- Sections
-- ============================
CREATE TABLE IF NOT EXISTS sections (
  id   INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(16) NOT NULL UNIQUE
);

-- ============================
-- Students
-- ============================
CREATE TABLE IF NOT EXISTS students (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  roll_no    VARCHAR(64)  NOT NULL UNIQUE,
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255),
  dept_id    INT,
  year       TINYINT,
  section_id INT,
  active     TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dept_id)    REFERENCES departments(id) ON DELETE SET NULL,
  FOREIGN KEY (section_id) REFERENCES sections(id)    ON DELETE SET NULL
);

-- index: (dept_id, year)
SET @idx_exists := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE table_schema = DATABASE()
    AND table_name   = 'students'
    AND index_name   = 'idx_students_dept_year'
);
SET @sql := IF(@idx_exists = 0,
  'CREATE INDEX idx_students_dept_year ON students(dept_id, year)',
  'SELECT "Index idx_students_dept_year already exists"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- index: (roll_no)
SET @idx_exists := (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE table_schema = DATABASE()
    AND table_name   = 'students'
    AND index_name   = 'idx_students_roll'
);
SET @sql := IF(@idx_exists = 0,
  'CREATE INDEX idx_students_roll ON students(roll_no)',
  'SELECT "Index idx_students_roll already exists"'
);
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ============================
-- Faculties
-- ============================
CREATE TABLE IF NOT EXISTS faculties (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) UNIQUE,
  dept_id    INT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dept_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- ============================
-- Subjects
-- ============================
CREATE TABLE IF NOT EXISTS subjects (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  code       VARCHAR(64)  NOT NULL UNIQUE,
  name       VARCHAR(255) NOT NULL,
  dept_id    INT,
  year       TINYINT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (dept_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- ============================
-- Faculty-Subjects mapping
-- ============================
CREATE TABLE IF NOT EXISTS faculty_subjects (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  faculty_id INT NOT NULL,
  subject_id INT NOT NULL,
  UNIQUE KEY uq_fac_sub (faculty_id, subject_id),
  FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id)  ON DELETE CASCADE
);

-- ============================
-- Users  (for login)
-- ============================
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('admin','faculty') NOT NULL DEFAULT 'faculty',
  faculty_id    INT,
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE SET NULL
);

-- ============================
-- Attendance sessions
-- ============================
DROP TABLE IF EXISTS attendance_sessions;

CREATE TABLE attendance_sessions (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  subject_id   INT NOT NULL,
  faculty_id   INT NOT NULL,
  session_date DATE NOT NULL,
  start_time   TIME DEFAULT NULL,
  end_time     TIME DEFAULT NULL,
  notes        TEXT,
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (subject_id)
    REFERENCES subjects(id)
    ON DELETE CASCADE,
  FOREIGN KEY (faculty_id)
    REFERENCES faculties(id)
    ON DELETE CASCADE,
  UNIQUE KEY uq_sub_fac_date (subject_id, faculty_id, session_date)
);

-- ============================
-- Attendance records
-- ============================
DROP TABLE IF EXISTS attendance_records;

CREATE TABLE attendance_records (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  session_id INT NOT NULL,
  status     ENUM('present','absent') NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
  FOREIGN KEY (session_id) REFERENCES attendance_sessions(id) ON DELETE CASCADE,
  UNIQUE KEY uq_session_student (student_id, session_id)
);

-- ============================
-- Seed data (safe to re-run)
-- ============================

-- Departments
INSERT INTO departments (code, name)
VALUES 
  ('CSE', 'Computer Science'),
  ('ECE', 'Electronics & Comm')
ON DUPLICATE KEY UPDATE
  name = VALUES(name);

-- Sections
INSERT INTO sections (name)
VALUES ('A'), ('B'), ('C')
ON DUPLICATE KEY UPDATE
  name = VALUES(name);

-- Demo student in CSE, Section A, Year 1
INSERT INTO students (roll_no, name, email, dept_id, year, section_id, active)
VALUES (
  '23CSE001',
  'Demo Student',
  'student1@example.com',
  (SELECT id FROM departments WHERE code = 'CSE' LIMIT 1),
  1,
  (SELECT id FROM sections WHERE name = 'A' LIMIT 1),
  1
)
ON DUPLICATE KEY UPDATE
  name       = VALUES(name),
  email      = VALUES(email),
  dept_id    = VALUES(dept_id),
  year       = VALUES(year),
  section_id = VALUES(section_id),
  active     = VALUES(active);

-- Demo faculty in CSE
INSERT INTO faculties (name, email, dept_id)
VALUES (
  'Demo Faculty',
  'faculty1@example.com',
  (SELECT id FROM departments WHERE code = 'CSE' LIMIT 1)
)
ON DUPLICATE KEY UPDATE
  name    = VALUES(name),
  dept_id = VALUES(dept_id);

-- Demo subject DBMS101 (Year 1, CSE)
INSERT INTO subjects (code, name, dept_id, year)
VALUES (
  'DBMS101',
  'Database Management Systems',
  (SELECT id FROM departments WHERE code = 'CSE' LIMIT 1),
  1
)
ON DUPLICATE KEY UPDATE
  name    = VALUES(name),
  dept_id = VALUES(dept_id),
  year    = VALUES(year);

-- Map demo faculty to DBMS101
INSERT INTO faculty_subjects (faculty_id, subject_id)
VALUES (
  (SELECT id FROM faculties WHERE email = 'faculty1@example.com' LIMIT 1),
  (SELECT id FROM subjects  WHERE code  = 'DBMS101' LIMIT 1)
)
ON DUPLICATE KEY UPDATE
  faculty_id = faculty_id;  -- no-op

-- Demo attendance session for DBMS101
INSERT INTO attendance_sessions (subject_id, faculty_id, session_date)
VALUES (
  (SELECT id FROM subjects  WHERE code  = 'DBMS101' LIMIT 1),
  (SELECT id FROM faculties WHERE email = 'faculty1@example.com' LIMIT 1),
  '2025-11-22'
)
ON DUPLICATE KEY UPDATE
  session_date = VALUES(session_date);

-- Demo attendance record: present
INSERT INTO attendance_records (student_id, session_id, status)
VALUES (
  (SELECT id FROM students WHERE roll_no = '23CSE001' LIMIT 1),
  (SELECT id FROM attendance_sessions
     WHERE subject_id = (SELECT id FROM subjects WHERE code = 'DBMS101' LIMIT 1)
       AND faculty_id = (SELECT id FROM faculties WHERE email = 'faculty1@example.com' LIMIT 1)
       AND session_date = '2025-11-22'
     ORDER BY id DESC LIMIT 1),
  'present'
)
ON DUPLICATE KEY UPDATE
  status = VALUES(status);

-- ============================
-- LOGIN USERS (plain-text passwords)
-- ============================

-- ADMIN user:  email = admin@example.com, password = admin123
INSERT INTO users (email, password_hash, role, faculty_id)
VALUES ('admin@example.com', 'admin123', 'admin', NULL)
ON DUPLICATE KEY UPDATE
  password_hash = VALUES(password_hash),
  role          = VALUES(role),
  faculty_id    = VALUES(faculty_id);

-- FACULTY user: email = faculty1@example.com, password = faculty123
INSERT INTO users (email, password_hash, role, faculty_id)
VALUES (
  'faculty1@example.com',
  'faculty123',
  'faculty',
  (SELECT id FROM faculties WHERE email = 'faculty1@example.com' LIMIT 1)
)
ON DUPLICATE KEY UPDATE
  password_hash = VALUES(password_hash),
  role          = VALUES(role),
  faculty_id    = VALUES(faculty_id);

SELECT * FROM subjects;
SELECT * FROM faculties;
SELECT * FROM faculty_subjects;

-- SAFE DELETE (safe update mode ke hisaab se)
DELETE FROM faculty_subjects
WHERE faculty_id = (SELECT id FROM faculties WHERE email = 'faculty1@example.com' LIMIT 1);

-- STEP 2: map faculty1@example.com to ALL subjects
INSERT INTO faculty_subjects (faculty_id, subject_id)
SELECT f.id, s.id
FROM faculties f
JOIN subjects s
WHERE f.email = 'faculty1@example.com';


-- 1) Attendance audit table (logs changes to attendance_records)
CREATE TABLE IF NOT EXISTS attendance_audit (
  id INT AUTO_INCREMENT PRIMARY KEY,
  attendance_record_id INT,
  old_status ENUM('present','absent'),
  new_status ENUM('present','absent'),
  changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2) Trigger: after UPDATE on attendance_records -> insert one audit row if status changed
DROP TRIGGER IF EXISTS trg_after_attendance_update;

DELIMITER $$
CREATE TRIGGER trg_after_attendance_update
AFTER UPDATE ON attendance_records
FOR EACH ROW
BEGIN
  -- Only log when status actually changed
  IF OLD.status <> NEW.status THEN
    INSERT INTO attendance_audit(attendance_record_id, old_status, new_status)
    VALUES (OLD.id, OLD.status, NEW.status);
  END IF;
END$$
DELIMITER ;

-- 3) Simple summary table to store per-session present counts
CREATE TABLE IF NOT EXISTS session_summary (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  total_present INT NOT NULL,
  generated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4) Stored procedure that uses a cursor to loop through sessions
--    For each session it counts how many 'present' records exist and inserts into session_summary.
DROP PROCEDURE IF EXISTS generate_session_summaries;

DELIMITER $$
CREATE PROCEDURE generate_session_summaries()
BEGIN
  DECLARE v_done INT DEFAULT 0;
  DECLARE v_session_id INT;
  DECLARE v_present_count INT;

  -- Cursor selects session ids
  DECLARE cur_sessions CURSOR FOR
    SELECT id FROM attendance_sessions ORDER BY id;

  -- When cursor is exhausted set v_done
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_done = 1;

  OPEN cur_sessions;

  read_loop: LOOP
    FETCH cur_sessions INTO v_session_id;
    IF v_done = 1 THEN
      LEAVE read_loop;
    END IF;

    -- Count present for this session
    SELECT COUNT(*) INTO v_present_count
    FROM attendance_records
    WHERE session_id = v_session_id AND status = 'present';

    -- Insert result into summary table
    INSERT INTO session_summary(session_id, total_present)
    VALUES (v_session_id, v_present_count);

  END LOOP read_loop;

  CLOSE cur_sessions;
END$$
DELIMITER ;

-- Usage:
-- CALL generate_session_summaries();
-- After running, check: SELECT * FROM session_summary ORDER BY generated_at DESC;

