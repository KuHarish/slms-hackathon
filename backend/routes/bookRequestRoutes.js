const express = require('express');
const router = express.Router();
const bookRequestController = require('../controllers/bookRequestController');

router.get('/', bookRequestController.getAllRequests);
router.get('/user/:user_id', bookRequestController.getRequests);
router.post('/', bookRequestController.createRequest);
router.put('/:id', bookRequestController.updateRequest);

module.exports = router;
