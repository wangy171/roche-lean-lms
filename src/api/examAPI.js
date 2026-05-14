/**
 * 考试管理 API 接口
 */

const express = require('express');
const router = express.Router();
const ExamService = require('../services/ExamService');

const examService = new ExamService();

/**
 * 创建考试
 * POST /api/exams
 */
router.post('/', async (req, res) => {
  try {
    const examData = req.body;
    const result = await examService.createExam(examData);
    res.status(201).json({
      code: 201,
      message: '考试创建成功',
      data: { examId: result.insertId }
    });
  } catch (error) {
    res.status(400).json({
      code: 400,
      message: error.message
    });
  }
});

/**
 * 添加考题
 * POST /api/exams/:examId/questions
 */
router.post('/:examId/questions', async (req, res) => {
  try {
    const examId = req.params.examId;
    const questionData = req.body;
    const questionId = await examService.addQuestion(examId, questionData);
    res.status(201).json({
      code: 201,
      message: '题目添加成功',
      data: { questionId }
    });
  } catch (error) {
    res.status(400).json({
      code: 400,
      message: error.message
    });
  }
});

/**
 * 获取考试详情
 * GET /api/exams/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const exam = await examService.getExam(req.params.id);
    res.json({
      code: 200,
      message: '成功',
      data: exam
    });
  } catch (error) {
    res.status(404).json({
      code: 404,
      message: error.message
    });
  }
});

/**
 * 发布考试
 * PUT /api/exams/:id/publish
 */
router.put('/:id/publish', async (req, res) => {
  try {
    await examService.publishExam(req.params.id);
    res.json({
      code: 200,
      message: '考试发布成功'
    });
  } catch (error) {
    res.status(400).json({
      code: 400,
      message: error.message
    });
  }
});

/**
 * 提交考卷
 * POST /api/exams/:examId/submit
 */
router.post('/:examId/submit', async (req, res) => {
  try {
    const { studentId, answers } = req.body;
    const result = await examService.submitExam(studentId, req.params.examId, answers);
    res.json({
      code: 200,
      message: '考卷已提交',
      data: result
    });
  } catch (error) {
    res.status(400).json({
      code: 400,
      message: error.message
    });
  }
});

/**
 * 获取学员成绩
 * GET /api/exams/scores/:studentId
 */
router.get('/scores/:studentId', async (req, res) => {
  try {
    const scores = await examService.getStudentExamScores(req.params.studentId);
    res.json({
      code: 200,
      message: '成功',
      data: scores
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message
    });
  }
});

/**
 * 获取成绩汇总
 * GET /api/exams/summary
 */
router.get('/summary/all', async (req, res) => {
  try {
    const summary = await examService.getScoreSummary();
    res.json({
      code: 200,
      message: '成功',
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message
    });
  }
});

/**
 * 获取学员成绩汇总
 * GET /api/exams/summary/:studentId
 */
router.get('/summary/:studentId', async (req, res) => {
  try {
    const summary = await examService.getScoreSummary(req.params.studentId);
    res.json({
      code: 200,
      message: '成功',
      data: summary
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message
    });
  }
});

module.exports = router;
