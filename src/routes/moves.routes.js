const express = require('express');
const router = express.Router();
const moveController = require('../controllers/move.controller');

router.get('/', moveController.getAllMoves);
router.get('/:id', moveController.getMoveById);
router.post('/', moveController.createMove);
router.put('/:id', moveController.updateMove);
router.delete('/:id', moveController.deleteMove);

module.exports = router;
