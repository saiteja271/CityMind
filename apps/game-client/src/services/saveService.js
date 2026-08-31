/**
 * saveService.js
 * Handles full save/load persistence wired to the CITYMIND backend API.
 * Supports both cloud saves (MongoDB via API) and local fallback (localStorage).
 */
import apiClient from './apiClient.js';

const LOCAL_SAVE_KEY = 'citymind_local_save';
const MAX_LOCAL_SAVES = 5;

// ─── Serialization helpers ────────────────────────────────────────────────────

/**
 * Serialize the current simulation state into a plain JSON-safe object.
 * @param {object} simulationState - Raw simulation state from SimulationEngine
 * @returns {object} Serialized payload ready for storage
 */
export function serializeState(simulationState) {
  if (!simulationState) throw new Error('simulationState is required');

  const {
    world,
    citizens,
    economy,
    time,
    environment,
    buildings,
    events,
    infrastructure,
    version = '1.0.0',
  } = simulationState;

  return {
    version,
    savedAt: new Date().toISOString(),
    world: world ? { ...world } : null,
    citizens: citizens ? JSON.parse(JSON.stringify(citizens)) : [],
    economy: economy ? { ...economy } : null,
    time: time ? { ...time } : null,
    environment: environment ? { ...environment } : null,
    buildings: buildings ? JSON.parse(JSON.stringify(buildings)) : [],
    events: events ? [...events] : [],
    infrastructure: infrastructure ? { ...infrastructure } : null,
  };
}

/**
 * Deserialize a stored save payload back into a simulation-compatible state.
 * @param {object} payload - Raw JSON payload from storage
 * @returns {object} Restored simulation state
 */
export function deserializeState(payload) {
  if (!payload) throw new Error('payload is required');
  if (!payload.version) throw new Error('Invalid save: missing version field');

  return {
    ...payload,
    restoredAt: new Date().toISOString(),
  };
}

// ─── Cloud save (API-backed) ──────────────────────────────────────────────────

/**
 * Save game state to the cloud via the backend API.
 * @param {string} cityId - The city's MongoDB ObjectId
 * @param {object} simulationState - Current simulation state
 * @param {object} [meta] - Optional metadata (slot name, description, thumbnail)
 * @returns {Promise<object>} Save record returned by the API
 */
export async function saveToCloud(cityId, simulationState, meta = {}) {
  if (!cityId) throw new Error('cityId is required for cloud save');

  const payload = serializeState(simulationState);

  const body = await apiClient.request(`/saves`, {
    method: 'POST',
    body: JSON.stringify({
      cityId,
      data: payload,
      slot: meta.slot ?? 'auto',
      description: meta.description ?? '',
      thumbnail: meta.thumbnail ?? null,
    }),
  });

  return body.data;
}

/**
 * Load a cloud save by save record ID.
 * @param {string} saveId - The save record's MongoDB ObjectId
 * @returns {Promise<object>} Deserialized simulation state
 */
export async function loadFromCloud(saveId) {
  if (!saveId) throw new Error('saveId is required');

  const body = await apiClient.request(`/saves/${saveId}`);
  return deserializeState(body.data.data);
}

/**
 * List all cloud saves for a given city.
 * @param {string} cityId
 * @returns {Promise<Array>} Array of save record summaries
 */
export async function listCloudSaves(cityId) {
  if (!cityId) throw new Error('cityId is required');
  const body = await apiClient.request(`/saves?cityId=${cityId}`);
  return body.data ?? [];
}

/**
 * Delete a cloud save record.
 * @param {string} saveId
 * @returns {Promise<void>}
 */
export async function deleteCloudSave(saveId) {
  if (!saveId) throw new Error('saveId is required');
  await apiClient.request(`/saves/${saveId}`, { method: 'DELETE' });
}

// ─── Local save (localStorage fallback) ──────────────────────────────────────

/**
 * Save game state locally in localStorage as a named slot.
 * Up to MAX_LOCAL_SAVES slots are retained; oldest is evicted on overflow.
 * @param {object} simulationState
 * @param {string} [slotName='autosave']
 * @returns {void}
 */
export function saveLocally(simulationState, slotName = 'autosave') {
  try {
    const payload = serializeState(simulationState);
    const rawList = localStorage.getItem(LOCAL_SAVE_KEY);
    const saves = rawList ? JSON.parse(rawList) : [];

    // Replace existing slot or prepend new
    const existingIdx = saves.findIndex((s) => s.slot === slotName);
    const entry = { slot: slotName, savedAt: payload.savedAt, data: payload };

    if (existingIdx >= 0) {
      saves[existingIdx] = entry;
    } else {
      saves.unshift(entry);
      if (saves.length > MAX_LOCAL_SAVES) saves.pop();
    }

    localStorage.setItem(LOCAL_SAVE_KEY, JSON.stringify(saves));
  } catch (err) {
    console.error('[saveService] Local save failed:', err);
  }
}

/**
 * Load game state from a local localStorage slot.
 * @param {string} [slotName='autosave']
 * @returns {object|null} Deserialized simulation state or null if not found
 */
export function loadLocally(slotName = 'autosave') {
  try {
    const rawList = localStorage.getItem(LOCAL_SAVE_KEY);
    if (!rawList) return null;
    const saves = JSON.parse(rawList);
    const entry = saves.find((s) => s.slot === slotName);
    return entry ? deserializeState(entry.data) : null;
  } catch (err) {
    console.error('[saveService] Local load failed:', err);
    return null;
  }
}

/**
 * List all local save slots.
 * @returns {Array<{slot: string, savedAt: string}>}
 */
export function listLocalSaves() {
  try {
    const rawList = localStorage.getItem(LOCAL_SAVE_KEY);
    if (!rawList) return [];
    const saves = JSON.parse(rawList);
    return saves.map(({ slot, savedAt }) => ({ slot, savedAt }));
  } catch (_) {
    return [];
  }
}

/**
 * Delete a local save slot by name.
 * @param {string} slotName
 */
export function deleteLocalSave(slotName) {
  try {
    const rawList = localStorage.getItem(LOCAL_SAVE_KEY);
    if (!rawList) return;
    const saves = JSON.parse(rawList).filter((s) => s.slot !== slotName);
    localStorage.setItem(LOCAL_SAVE_KEY, JSON.stringify(saves));
  } catch (_) {}
}

// ─── Auto-save manager ────────────────────────────────────────────────────────

let _autoSaveTimer = null;

/**
 * Start periodic auto-save. Attempts cloud save first; falls back to local.
 * @param {object} opts
 * @param {Function} opts.getState - Function that returns current simulation state
 * @param {string} [opts.cityId] - Optional city ID for cloud saves
 * @param {number} [opts.intervalMs=300000] - Auto-save interval in ms (default 5 min)
 * @param {Function} [opts.onSave] - Callback called after each auto-save
 */
export function startAutoSave({ getState, cityId, intervalMs = 300_000, onSave }) {
  stopAutoSave();
  _autoSaveTimer = setInterval(async () => {
    const state = getState();
    if (!state) return;

    try {
      if (cityId && apiClient.accessToken) {
        await saveToCloud(cityId, state, { slot: 'autosave', description: 'Auto-save' });
      } else {
        saveLocally(state, 'autosave');
      }
      if (typeof onSave === 'function') onSave({ success: true, at: new Date().toISOString() });
    } catch (err) {
      // Fallback to local on cloud failure
      saveLocally(state, 'autosave');
      console.warn('[saveService] Cloud auto-save failed, fell back to local:', err.message);
      if (typeof onSave === 'function') onSave({ success: false, fallback: true, error: err.message });
    }
  }, intervalMs);
}

/**
 * Stop the periodic auto-save timer.
 */
export function stopAutoSave() {
  if (_autoSaveTimer) {
    clearInterval(_autoSaveTimer);
    _autoSaveTimer = null;
  }
}
