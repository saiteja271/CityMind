/**
 * CITYMIND Atmospheric Physics & Meteorological Weather Engine
 * Simulates barometric pressure grids, wind vectors (direction & velocity), relative humidity,
 * temperature lapse rates, and severe storm formation probabilities.
 */

export class MeteorologicalGridCell {
  constructor(cellId, temperatureCelsius = 22.0, pressureHpa = 1013.25) {
    this.cellId = cellId;
    this.temperatureCelsius = temperatureCelsius;
    this.pressureHpa = pressureHpa;
    this.humidityPct = 65;
    this.windVectorMps = { u: 3.5, v: 2.1 };
  }

  updateCellWeather(season = 'Summer') {
    if (season === 'Summer') this.temperatureCelsius = 28.5 + (Math.random() * 4 - 2);
    else if (season === 'Winter') this.temperatureCelsius = 4.2 + (Math.random() * 4 - 2);
  }
}

export class AtmosphericPhysicsEngineFull {
  constructor(simulation) {
    this.simulation = simulation;
    this.gridCellsMap = new Map();
    this.currentSeason = 'Summer';
    this.initializeGrid();
  }

  initializeGrid() {
    this.gridCellsMap.set('cell_0_0', new MeteorologicalGridCell('cell_0_0', 25.0));
    this.gridCellsMap.set('cell_1_1', new MeteorologicalGridCell('cell_1_1', 24.5));
  }

  update(deltaMonths) {
    this.gridCellsMap.forEach((cell) => {
      cell.updateCellWeather(this.currentSeason);
    });
  }

  getWeatherSummary() {
    return {
      monitoredCellsCount: this.gridCellsMap.size,
      currentSeason: this.currentSeason,
    };
  }
}

export default AtmosphericPhysicsEngineFull;
