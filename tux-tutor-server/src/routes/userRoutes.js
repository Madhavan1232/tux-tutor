const express = require('express');
const { updateUserName } = require('../controllers/userController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

router.patch('/name', requireAuth, updateUserName);

module.exports = router;

