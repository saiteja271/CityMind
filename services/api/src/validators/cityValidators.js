/**
 * cityValidators - Input validation helpers for city and save payloads.
 */
export function validateCityCreate(body) {
  const errors = [];
  if (!body || typeof body !== 'object') {
    return { ok: false, errors: ['body required'] };
  }
  if (!body.name || typeof body.name !== 'string' || body.name.trim().length < 1) {
    errors.push('name is required');
  } else if (body.name.trim().length > 64) {
    errors.push('name must be at most 64 characters');
  }
  if (body.mode && !['sandbox', 'scenario', 'challenge'].includes(body.mode)) {
    errors.push('mode must be sandbox, scenario, or challenge');
  }
  if (body.mapWidth != null) {
    const w = Number(body.mapWidth);
    if (!Number.isFinite(w) || w < 32 || w > 256) errors.push('mapWidth must be 32-256');
  }
  if (body.mapHeight != null) {
    const h = Number(body.mapHeight);
    if (!Number.isFinite(h) || h < 32 || h > 256) errors.push('mapHeight must be 32-256');
  }
  return { ok: errors.length === 0, errors };
}

export function validateCityUpdate(body) {
  const errors = [];
  if (!body || typeof body !== 'object') return { ok: false, errors: ['body required'] };
  if (body.name != null && (typeof body.name !== 'string' || body.name.trim().length < 1 || body.name.length > 64)) {
    errors.push('invalid name');
  }
  if (body.population != null && (typeof body.population !== 'number' || body.population < 0)) {
    errors.push('population must be non-negative number');
  }
  if (body.happiness != null && (typeof body.happiness !== 'number' || body.happiness < 0 || body.happiness > 100)) {
    errors.push('happiness must be 0-100');
  }
  if (body.budget != null && typeof body.budget !== 'number') {
    errors.push('budget must be a number');
  }
  if (body.isPublic != null && typeof body.isPublic !== 'boolean') {
    errors.push('isPublic must be boolean');
  }
  return { ok: errors.length === 0, errors };
}

export function validateSaveSlot(slot) {
  const n = Number(slot);
  if (!Number.isInteger(n) || n < 1 || n > 10) {
    return { ok: false, errors: ['slot must be integer 1-10'] };
  }
  return { ok: true, errors: [], slot: n };
}

export default { validateCityCreate, validateCityUpdate, validateSaveSlot };
