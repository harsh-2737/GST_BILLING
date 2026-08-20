const express = require('express');
const router = express.Router();
const { createGST, getAllGST, getGSTById, updateGST, deleteGST } = require('../controllers/GSTController');

router.post('/create', createGST);
router.get('/', getAllGST);
router.get('/:id', getGSTById);
router.put('/update/:id', updateGST);
router.delete('/delete/:id', deleteGST);

module.exports = router;