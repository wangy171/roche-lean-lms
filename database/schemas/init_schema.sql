/**
 * 数据库初始化脚本
 */

-- 创建学生表
CREATE TABLE IF NOT EXISTS students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE,
  department VARCHAR(50),
  position VARCHAR(50),
  enroll_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_department (department)
);

-- 创建课程表
CREATE TABLE IF NOT EXISTS courses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50),
  description TEXT,
  duration INT,
  content TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category)
);

-- 创建学习进度表
CREATE TABLE IF NOT EXISTS learning_progress (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  course_id INT NOT NULL,
  progress_percentage INT DEFAULT 0,
  completed TINYINT DEFAULT 0,
  last_access TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (course_id) REFERENCES courses(id),
  UNIQUE KEY unique_student_course (student_id, course_id),
  INDEX idx_completed (completed)
);

-- 创建考试表
CREATE TABLE IF NOT EXISTS exams (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(200) NOT NULL,
  course_id INT,
  description TEXT,
  total_questions INT,
  passing_score INT DEFAULT 60,
  duration INT,
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id),
  INDEX idx_status (status)
);

-- 创建题目表
CREATE TABLE IF NOT EXISTS questions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  exam_id INT NOT NULL,
  question_text TEXT NOT NULL,
  question_type VARCHAR(20),
  score INT DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE,
  INDEX idx_exam_id (exam_id)
);

-- 创建选项表
CREATE TABLE IF NOT EXISTS options (
  id INT PRIMARY KEY AUTO_INCREMENT,
  question_id INT NOT NULL,
  option_text TEXT,
  is_correct TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
  INDEX idx_question_id (question_id)
);

-- 创建考评成绩表
CREATE TABLE IF NOT EXISTS exam_scores (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  exam_id INT NOT NULL,
  score INT,
  passed TINYINT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (exam_id) REFERENCES exams(id),
  INDEX idx_student_id (student_id),
  INDEX idx_exam_id (exam_id),
  INDEX idx_passed (passed)
);

-- 创建学员答题表
CREATE TABLE IF NOT EXISTS student_answers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  exam_id INT NOT NULL,
  question_id INT NOT NULL,
  answer TEXT,
  is_correct TINYINT DEFAULT 0,
  score INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (exam_id) REFERENCES exams(id),
  FOREIGN KEY (question_id) REFERENCES questions(id),
  INDEX idx_student_exam (student_id, exam_id)
);

-- 创建成绩统计表
CREATE TABLE IF NOT EXISTS score_summary (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id INT NOT NULL,
  exam_id INT,
  total_exams INT DEFAULT 0,
  passed_exams INT DEFAULT 0,
  avg_score DECIMAL(5,2),
  highest_score INT,
  lowest_score INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES students(id),
  UNIQUE KEY unique_student_exam (student_id, exam_id)
);

-- 插入示例课程数据
INSERT INTO courses (name, category, description, duration) VALUES
('精益入门理论', '理论', '学习精益管理的基础理论和概念', 8),
('精益基础工具', '工具', '掌握基本的精益工具和方法', 16),
('精益分析工具', '工具', '学习数据分析工具和方法', 12),
('精益进阶工具', '工具', '深入学习高级精益工具', 20),
('精益六西格玛', '高级', '掌握六西格玛方法论', 24),
('如何进行一次5S实践', '实践', '5S现场管理实践指导', 10),
('实践案例', '实践', '精益转型实际案例分析', 15);
