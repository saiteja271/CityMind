/**
 * saveRoutes.js
 * REST routes for city save-game persistence.
 * Base path: /api/v1/saves
 */
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const saveController = require('../controllers/saveController');

// All save routes require authentication
router.use(authenticate);

// POST   /saves           — Create a new save record
router.post('/', saveController.createSave);

// GET    /saves           — List saves (filter by ?cityId=...)
router.get('/', saveController.listSaves);

// GET    /saves/:id       — Get a specific save record (with full data)
router.get('/:id', saveController.getSave);

// PATCH  /saves/:id       — Update save metadata (description, thumbnail)
router.patch('/:id', saveController.updateSave);

// DELETE /saves/:id       — Delete a save record
router.delete('/:id', saveController.deleteSave);

module.exports = router;
