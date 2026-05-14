/**
 * 考试管理服务
 */

class ExamService {
  constructor(db) {
    this.db = db;
  }

  /**
   * 创建考试
   */
  async createExam(examData) {
    const { name, courseId, description, totalQuestions, passingScore, duration, status } = examData;
    const sql = `
      INSERT INTO exams (name, course_id, description, total_questions, passing_score, duration, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `;
    return new Promise((resolve, reject) => {
      this.db.query(sql, [name, courseId, description, totalQuestions, passingScore, duration, status || 'draft'], (err, result) => {
        if (err) reject(err);
        else resolve(result);
      });
    });
  }

  /**
   * 添加考题
   */
  async addQuestion(examId, questionData) {
    const { questionText, questionType, correctAnswer, options, score } = questionData;
    
    return new Promise(async (resolve, reject) => {
      try {
        // 插入题目
        const sql = `
          INSERT INTO questions (exam_id, question_text, question_type, score, created_at)
          VALUES (?, ?, ?, ?, NOW())
        `;
        
        this.db.query(sql, [examId, questionText, questionType, score], async (err, result) => {
          if (err) {
            reject(err);
            return;
          }

          const questionId = result.insertId;

          // 如果有选项，插入选项
          if (options && options.length > 0) {
            const optionSql = `INSERT INTO options (question_id, option_text, is_correct) VALUES ?`;
            const optionValues = options.map(opt => [questionId, opt.text, opt.isCorrect ? 1 : 0]);

            this.db.query(optionSql, [optionValues], (err) => {
              if (err) reject(err);
              else resolve(questionId);
            });
          } else {
            resolve(questionId);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 获取考试详情
   */
  async getExam(examId) {
    const sql = `
      SELECT 
        e.*,
        c.name as course_name,
        COUNT(DISTINCT q.id) as question_count
      FROM exams e
      LEFT JOIN courses c ON e.course_id = c.id
      LEFT JOIN questions q ON e.id = q.exam_id
      WHERE e.id = ?
      GROUP BY e.id
    `;
    return new Promise((resolve, reject) => {
      this.db.query(sql, [examId], (err, results) => {
        if (err) reject(err);
        else if (results.length === 0) reject(new Error('考试不存在'));
        else resolve(results[0]);
      });
    });
  }

  /**
   * 获取考试题目
   */
  async getExamQuestions(examId) {
    const sql = `
      SELECT 
        q.id,
        q.question_text,
        q.question_type,
        q.score,
        o.id as option_id,
        o.option_text,
        o.is_correct
      FROM questions q
      LEFT JOIN options o ON q.id = o.question_id
      WHERE q.exam_id = ?
      ORDER BY q.id, o.id
    `;
    return new Promise((resolve, reject) => {
      this.db.query(sql, [examId], (err, results) => {
        if (err) {
          reject(err);
          return;
        }

        // 格式化数据
        const questions = {};
        results.forEach(row => {
          if (!questions[row.id]) {
            questions[row.id] = {
              id: row.id,
              text: row.question_text,
              type: row.question_type,
              score: row.score,
              options: []
            };
          }
          if (row.option_id) {
            questions[row.id].options.push({
              id: row.option_id,
              text: row.option_text,
              isCorrect: row.is_correct
            });
          }
        });

        resolve(Object.values(questions));
      });
    });
  }

  /**
   * 发布考试
   */
  async publishExam(examId) {
    const sql = 'UPDATE exams SET status = "published", updated_at = NOW() WHERE id = ?';
    return new Promise((resolve, reject) => {
      this.db.query(sql, [examId], (err, result) => {
        if (err) reject(err);
        else if (result.affectedRows === 0) reject(new Error('考试不存在'));
        else resolve(result);
      });
    });
  }

  /**
   * 提交考卷
   */
  async submitExam(studentId, examId, answers) {
    return new Promise(async (resolve, reject) => {
      try {
        // 获取考试信息
        const exam = await this.getExam(examId);
        const questions = await this.getExamQuestions(examId);

        // 自动评分
        let totalScore = 0;
        const answerRecords = [];

        for (const answer of answers) {
          const question = questions.find(q => q.id === answer.questionId);
          if (!question) continue;

          let score = 0;
          let isCorrect = false;

          // 判断答案正确性
          if (question.type === 'single_choice' || question.type === 'multiple_choice') {
            const correctOptions = question.options.filter(opt => opt.isCorrect).map(opt => opt.id);
            const studentAnswers = Array.isArray(answer.answer) ? answer.answer : [answer.answer];
            
            if (JSON.stringify(correctOptions.sort()) === JSON.stringify(studentAnswers.sort())) {
              score = question.score;
              isCorrect = true;
            }
          } else if (question.type === 'true_false') {
            if (answer.answer === question.options[0]?.isCorrect) {
              score = question.score;
              isCorrect = true;
            }
          }

          totalScore += score;
          answerRecords.push({
            studentId,
            questionId: answer.questionId,
            answer: JSON.stringify(answer.answer),
            isCorrect,
            score
          });
        }

        // 保存答题记录
        const saveSql = `INSERT INTO student_answers (student_id, exam_id, question_id, answer, is_correct, score, created_at) 
                         VALUES (?, ?, ?, ?, ?, ?, NOW())`;
        
        for (const record of answerRecords) {
          await new Promise((res, rej) => {
            this.db.query(saveSql, [
              record.studentId,
              examId,
              record.questionId,
              record.answer,
              record.isCorrect ? 1 : 0,
              record.score
            ], (err) => {
              if (err) rej(err);
              else res();
            });
          });
        }

        // 保存成绩
        const scoreSql = `INSERT INTO exam_scores (student_id, exam_id, score, passed, created_at)
                          VALUES (?, ?, ?, ?, NOW())`;
        const passed = totalScore >= exam.passing_score ? 1 : 0;

        await new Promise((res, rej) => {
          this.db.query(scoreSql, [studentId, examId, totalScore, passed], (err, result) => {
            if (err) rej(err);
            else res(result);
          });
        });

        resolve({
          totalScore,
          passingScore: exam.passing_score,
          passed: passed === 1,
          correctCount: answerRecords.filter(r => r.isCorrect).length,
          totalQuestions: questions.length
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * 获取学员成绩
   */
  async getStudentExamScores(studentId) {
    const sql = `
      SELECT 
        es.id,
        es.student_id,
        es.exam_id,
        e.name as exam_name,
        c.name as course_name,
        es.score,
        es.passed,
        es.created_at
      FROM exam_scores es
      LEFT JOIN exams e ON es.exam_id = e.id
      LEFT JOIN courses c ON e.course_id = c.id
      WHERE es.student_id = ?
      ORDER BY es.created_at DESC
    `;
    return new Promise((resolve, reject) => {
      this.db.query(sql, [studentId], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

  /**
   * 获取成绩汇总
   */
  async getScoreSummary(studentId = null) {
    let sql = `
      SELECT 
        CASE 
          WHEN ? IS NULL THEN NULL 
          ELSE s.id 
        END as student_id,
        CASE 
          WHEN ? IS NULL THEN NULL 
          ELSE s.name 
        END as student_name,
        e.id as exam_id,
        e.name as exam_name,
        c.name as course_name,
        COUNT(*) as exam_taken_count,
        MAX(es.score) as highest_score,
        MIN(es.score) as lowest_score,
        ROUND(AVG(es.score), 2) as avg_score,
        SUM(CASE WHEN es.passed = 1 THEN 1 ELSE 0 END) as pass_count,
        SUM(CASE WHEN es.passed = 0 THEN 1 ELSE 0 END) as fail_count
      FROM exam_scores es
      LEFT JOIN exams e ON es.exam_id = e.id
      LEFT JOIN courses c ON e.course_id = c.id
      LEFT JOIN students s ON es.student_id = s.id
    `;
    
    const params = [studentId, studentId];

    if (studentId) {
      sql += ' WHERE es.student_id = ?';
      params.push(studentId);
    }

    sql += ' GROUP BY e.id ORDER BY e.id DESC';

    return new Promise((resolve, reject) => {
      this.db.query(sql, params, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    });
  }

  /**
   * 获取班级成绩统计
   */
  async getClassScoreStats(department) {
    const sql = `
      SELECT 
        s.department,
        COUNT(DISTINCT s.id) as total_students,
        COUNT(DISTINCT es.student_id) as exam_takers,
        COUNT(DISTINCT CASE WHEN es.passed = 1 THEN es.student_id END) as pass_students,
        ROUND(COUNT(DISTINCT CASE WHEN es.passed = 1 THEN es.student_id END) * 100.0 / COUNT(DISTINCT es.student_id), 2) as pass_rate,
        ROUND(AVG(es.score), 2) as avg_score,
        MIN(es.score) as min_score,
        MAX(es.score) as max_score
      FROM students s
      LEFT JOIN exam_scores es ON s.id = es.student_id
      WHERE s.department = ?
      GROUP BY s.department
    `;
    return new Promise((resolve, reject) => {
      this.db.query(sql, [department], (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  }
}

module.exports = ExamService;
