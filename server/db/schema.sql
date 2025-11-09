CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(200),
  role VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);
CREATE TABLE batches (
  id SERIAL PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  created_by INT REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now()
);
CREATE TABLE batch_members (
  id SERIAL PRIMARY KEY,
  batch_id INT REFERENCES batches(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  role_in_batch VARCHAR(20) DEFAULT 'student'
);
CREATE TABLE assignments (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  batch_id INT REFERENCES batches(id) ON DELETE CASCADE,
  created_by INT REFERENCES users(id),
  points INT DEFAULT 100,
  due_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT now()
);
CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  assignment_id INT REFERENCES assignments(id) ON DELETE CASCADE,
  student_id INT REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  file_url TEXT,
  submitted_at TIMESTAMP DEFAULT now(),
  grade INT,
  feedback TEXT
);
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  batch_id INT REFERENCES batches(id) ON DELETE CASCADE,
  title VARCHAR(255),
  description TEXT,
  start_ts TIMESTAMP,
  end_ts TIMESTAMP,
  created_by INT REFERENCES users(id)
);
