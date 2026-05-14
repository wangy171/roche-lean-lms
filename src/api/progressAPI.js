/**
 * 学习进度管理 API 接口
 */

const express = require('express');
const router = express.Router();
const LearningProgressService = require('../services/LearningProgressService');

const progressService = new LearningProgressService();

/**
 * 获取学员学习进度
 * GET /api/progress/:studentId
 */
router.get('/:studentId', async (req, res) => {
  try {
    const progress = await progressService.getStudentProgress(req.params.studentId);
    res.json({
      code: 200,
      message: '成功',
      data: progress
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message
    });
  }
});

/**
 * 更新学习进度
 * PUT /api/progress/:studentId/:courseId
 */
router.put('/:studentId/:courseId', async (req, res) => {
  try {
    const { percentage, completed } = req.body;
    await progressService.updateProgress(req.params.studentId, req.params.courseId, percentage, completed);
    res.json({
      code: 200,
      message: '学习进度已更新'
    });
  } catch (error) {
    res.status(400).json({
      code: 400,
      message: error.message
    });
  }
});

/**
 * 获取不活跃学员预警
 * GET /api/progress/inactive/warning?days=7
 */
router.get('/inactive/warning', async (req, res) => {
  try {
    const days = req.query.days || 7;
    const inactiveStudents = await progressService.getInactiveStudents(days);
    res.json({
      code: 200,
      message: '成功',
      data: inactiveStudents
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message
    });
  }
});

/**
 * 获取进度报告汇总
 * GET /api/progress/report/summary
 */
router.get('/report/summary', async (req, res) => {
  try {
    const summary = await progressService.getProgressReport();
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
 * 获取课程学习统计
 * GET /api/progress/course/:courseId
 */
router.get('/course/:courseId', async (req, res) => {
  try {
    const stats = await progressService.getCourseStats(req.params.courseId);
    res.json({
      code: 200,
      message: '成功',
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message
    });
  }
});

/**
 * 获取按类别统计的学习进度
 * GET /api/progress/category/:category
 */
router.get('/category/:category', async (req, res) => {
  try {
    const stats = await progressService.getCategoryStats(req.params.category);
    res.json({
      code: 200,
      message: '成功',
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message
    });
  }
});

module.exports = router;
