/**
 * Save.js — Mongoose model for city save-game records.
 */
const mongoose = require('mongoose');

const SaveSchema = new mongoose.Schema(
  {
    city: { type: mongoose.Schema.Types.ObjectId, ref: 'City', required: true, index: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    slot: { type: String, required: true, trim: true },
    description: { type: String, default: '', maxlength: 200 },
    thumbnail: { type: String, default: null }, // base64 or URL
    data: { type: mongoose.Schema.Types.Mixed, required: true }, // Full simulation state
    savedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Compound index to enforce unique slot per city per owner
SaveSchema.index({ city: 1, owner: 1, slot: 1 }, { unique: false });

/** Return a lightweight summary (excludes heavy data field) */
SaveSchema.methods.toSummary = function () {
  return {
    _id: this._id,
    city: this.city,
    slot: this.slot,
    description: this.description,
    thumbnail: this.thumbnail,
    savedAt: this.savedAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

module.exports = mongoose.model('Save', SaveSchema);
