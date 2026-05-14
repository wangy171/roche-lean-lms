/**
 * 课程管理 API 接口
 */

const express = require('express');
const router = express.Router();

/**
 * 获取课程列表
 * GET /api/courses?category=工具
 */
router.get('/', async (req, res) => {
  try {
    // 这里应该调用数据库查询
    const category = req.query.category;
    // 实现课程查询逻辑
    res.json({
      code: 200,
      message: '成功',
      data: []
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message
    });
  }
});

/**
 * 获取课程详情
 * GET /api/courses/:id
 */
router.get('/:id', async (req, res) => {
  try {
    res.json({
      code: 200,
      message: '成功',
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message
    });
  }
});

/**
 * 创建课程
 * POST /api/courses
 */
router.post('/', async (req, res) => {
  try {
    const courseData = req.body;
    res.status(201).json({
      code: 201,
      message: '课程创建成功',
      data: { courseId: 1 }
    });
  } catch (error) {
    res.status(400).json({
      code: 400,
      message: error.message
    });
  }
});

/**
 * 获取课程分类统计
 * GET /api/courses/stats/category
 */
router.get('/stats/category', async (req, res) => {
  try {
    res.json({
      code: 200,
      message: '成功',
      data: []
    });
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: error.message
    });
  }
});

module.exports = router;
