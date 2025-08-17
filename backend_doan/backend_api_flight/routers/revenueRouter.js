const express = require('express');
const router = express.Router();
const revenueController = require('../controllers/revenueController');

// Get total revenue
router.get('/total', revenueController.getTotalRevenue);

// Get daily revenue
router.get('/daily', revenueController.getDailyRevenue);

// Get monthly and yearly revenue
router.get('/monthly-yearly', revenueController.getMonthlyYearlyRevenue);

// Get revenue by specific date
router.get('/by-date', revenueController.getRevenueByDate);

module.exports = router; 