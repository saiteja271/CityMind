/**
 * CityService - Business logic for city CRUD, ownership checks, and state snapshots.
 */
export class CityService {
  constructor(CityModel, SaveModel) {
    this.City = CityModel;
    this.Save = SaveModel;
  }

  async listForUser(userId, { includePublic = true, limit = 50 } = {}) {
    const filter = includePublic
      ? { $or: [{ owner: userId }, { isPublic: true }] }
      : { owner: userId };
    return this.City.find(filter).sort({ updatedAt: -1 }).limit(limit).populate('owner', 'username displayName');
  }

  async getById(cityId, userId = null) {
    const city = await this.City.findById(cityId).populate('owner', 'username displayName');
    if (!city) {
      const err = new Error('City not found');
      err.status = 404;
      throw err;
    }
    if (!city.isPublic && userId && String(city.owner._id || city.owner) !== String(userId)) {
      const err = new Error('Access denied');
      err.status = 403;
      throw err;
    }
    return city;
  }

  async create(userId, payload) {
    const { name, mode, mapWidth, mapHeight, seed } = payload;
    if (!name || typeof name !== 'string' || name.trim().length < 1) {
      const err = new Error('name required');
      err.status = 400;
      throw err;
    }
    return this.City.create({
      name: name.trim().slice(0, 64),
      owner: userId,
      mode: mode || 'sandbox',
      mapWidth: mapWidth || 80,
      mapHeight: mapHeight || 80,
      seed: seed || Date.now(),
      population: 0,
      happiness: 50,
      budget: 5000000,
      year: 1
    });
  }

  async update(cityId, userId, patch, isAdmin = false) {
    const city = await this.City.findById(cityId);
    if (!city) {
      const err = new Error('City not found');
      err.status = 404;
      throw err;
    }
    if (String(city.owner) !== String(userId) && !isAdmin) {
      const err = new Error('Access denied');
      err.status = 403;
      throw err;
    }
    const allowed = ['name', 'population', 'happiness', 'budget', 'year', 'metadata', 'isPublic'];
    for (const key of allowed) {
      if (patch[key] !== undefined) city[key] = patch[key];
    }
    await city.save();
    return city;
  }

  async remove(cityId, userId, isAdmin = false) {
    const city = await this.City.findById(cityId);
    if (!city) {
      const err = new Error('City not found');
      err.status = 404;
      throw err;
    }
    if (String(city.owner) !== String(userId) && !isAdmin) {
      const err = new Error('Access denied');
      err.status = 403;
      throw err;
    }
    await city.deleteOne();
    if (this.Save) await this.Save.deleteMany({ city: cityId });
    return { deleted: true };
  }

  async updateStatsFromSnapshot(cityId, snapshot) {
    const city = await this.City.findById(cityId);
    if (!city) return null;
    if (snapshot.population != null) city.population = snapshot.population;
    if (snapshot.happiness != null) city.happiness = snapshot.happiness;
    if (snapshot.budget != null) city.budget = snapshot.budget;
    if (snapshot.year != null) city.year = snapshot.year;
    await city.save();
    return city;
  }
}

export default CityService;
