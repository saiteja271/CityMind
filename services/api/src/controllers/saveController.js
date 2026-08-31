/**
 * saveController.js
 * Controller for save-game persistence endpoints.
 * Handles CRUD operations for Save documents in MongoDB.
 */
const Save = require('../models/Save');
const City = require('../models/City');

// ─── POST /saves ──────────────────────────────────────────────────────────────
exports.createSave = async (req, res) => {
  try {
    const { cityId, data, slot, description, thumbnail } = req.body;

    if (!cityId || !data) {
      return res.status(400).json({ error: { message: 'cityId and data are required' } });
    }

    // Verify the city belongs to the authenticated user
    const city = await City.findOne({ _id: cityId, owner: req.user._id });
    if (!city) {
      return res.status(404).json({ error: { message: 'City not found or access denied' } });
    }

    // Enforce max 10 save slots per city per user
    const existingCount = await Save.countDocuments({ city: cityId, owner: req.user._id });
    if (existingCount >= 10 && slot !== 'autosave') {
      return res.status(400).json({ error: { message: 'Save slot limit reached (max 10 per city)' } });
    }

    // Upsert autosave slot
    let save;
    if (slot === 'autosave') {
      save = await Save.findOneAndUpdate(
        { city: cityId, owner: req.user._id, slot: 'autosave' },
        { data, description: description || 'Auto-save', thumbnail, savedAt: new Date() },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } else {
      save = await Save.create({
        city: cityId,
        owner: req.user._id,
        slot: slot || `slot_${Date.now()}`,
        data,
        description: description || '',
        thumbnail: thumbnail || null,
        savedAt: new Date(),
      });
    }

    res.status(201).json({ data: save.toSummary() });
  } catch (err) {
    console.error('[saveController.createSave]', err);
    res.status(500).json({ error: { message: 'Failed to create save' } });
  }
};

// ─── GET /saves ───────────────────────────────────────────────────────────────
exports.listSaves = async (req, res) => {
  try {
    const { cityId } = req.query;
    const filter = { owner: req.user._id };
    if (cityId) filter.city = cityId;

    const saves = await Save.find(filter)
      .select('-data') // Exclude heavy payload from list
      .sort({ savedAt: -1 })
      .limit(50);

    res.json({ data: saves.map((s) => s.toSummary()) });
  } catch (err) {
    console.error('[saveController.listSaves]', err);
    res.status(500).json({ error: { message: 'Failed to list saves' } });
  }
};

// ─── GET /saves/:id ───────────────────────────────────────────────────────────
exports.getSave = async (req, res) => {
  try {
    const save = await Save.findOne({ _id: req.params.id, owner: req.user._id });
    if (!save) return res.status(404).json({ error: { message: 'Save not found' } });

    res.json({ data: save.toObject() });
  } catch (err) {
    console.error('[saveController.getSave]', err);
    res.status(500).json({ error: { message: 'Failed to load save' } });
  }
};

// ─── PATCH /saves/:id ─────────────────────────────────────────────────────────
exports.updateSave = async (req, res) => {
  try {
    const { description, thumbnail } = req.body;
    const save = await Save.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { ...(description !== undefined && { description }), ...(thumbnail !== undefined && { thumbnail }) },
      { new: true }
    );
    if (!save) return res.status(404).json({ error: { message: 'Save not found' } });

    res.json({ data: save.toSummary() });
  } catch (err) {
    console.error('[saveController.updateSave]', err);
    res.status(500).json({ error: { message: 'Failed to update save' } });
  }
};

// ─── DELETE /saves/:id ────────────────────────────────────────────────────────
exports.deleteSave = async (req, res) => {
  try {
    const save = await Save.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
    if (!save) return res.status(404).json({ error: { message: 'Save not found' } });

    res.json({ data: { deleted: true } });
  } catch (err) {
    console.error('[saveController.deleteSave]', err);
    res.status(500).json({ error: { message: 'Failed to delete save' } });
  }
};
