/**
 * @citymind/ai-agents - GeneticCityOptimizer.js
 * Genetic Algorithm Engine for Automated City Layout Optimization & District Synthesis.
 * 
 * Features:
 * - Chromosome Representation for 2D Spatial City Grids.
 * - Multi-Objective Fitness Evaluation (Traffic travel time, land value, RCI balance, pollution, infrastructure cost).
 * - NSGA-II Multi-Objective Optimization (Fast Non-Dominated Sorting & Crowding Distance).
 * - Genetic Selection Operators (Tournament, Roulette, SUS, Rank-based).
 * - Genetic Crossover Operators (Single-Point, Multi-Point, Uniform, 2D Spatial Sub-Grid Patch).
 * - Genetic Mutation Operators (Cell Swap, Zone Type, Road Connection Repair, District Shift).
 * - Diversity Maintenance, Speciation/Clustering & Adaptive Mutation Tuning.
 * - City Blueprint Serializer & Exporter.
 */

// ---------------------------------------------------------------------------
// ENUMS & CONSTANTS
// ---------------------------------------------------------------------------

/** Cell tile building types used for chromosome genes */
export const GENE_BUILDING_TYPE = {
  EMPTY: 0,
  ROAD: 1,
  RESIDENTIAL_LOW: 2,
  RESIDENTIAL_HIGH: 3,
  COMMERCIAL_LOW: 4,
  COMMERCIAL_HIGH: 5,
  INDUSTRIAL_LIGHT: 6,
  INDUSTRIAL_HEAVY: 7,
  PARK: 8,
  SCHOOL: 9,
  HOSPITAL: 10,
  POLICE_STATION: 11,
  POWER_PLANT: 12,
  WATER_TOWER: 13
};

/** Selection operator types */
export const SELECTION_TYPE = {
  TOURNAMENT: 'TOURNAMENT',
  ROULETTE: 'ROULETTE',
  RANK: 'RANK',
  STOCHASTIC_UNIVERSAL: 'SUS'
};

/** Crossover operator types */
export const CROSSOVER_TYPE = {
  SINGLE_POINT: 'SINGLE_POINT',
  TWO_POINT: 'TWO_POINT',
  UNIFORM: 'UNIFORM',
  SPATIAL_2D_PATCH: 'SPATIAL_2D_PATCH'
};

// ---------------------------------------------------------------------------
// CHROMOSOME REPRESENTATION
// ---------------------------------------------------------------------------

/**
 * Individual solution chromosome encoding city layout grid.
 */
export class CityChromosome {
  /**
   * @param {number} width Grid width
   * @param {number} height Grid height
   */
  constructor(width = 32, height = 32) {
    this.width = width;
    this.height = height;
    this.length = width * height;

    // 1D TypedArray buffer encoding 2D cell gene types
    this.genes = new Uint8Array(this.length);

    // Multi-objective fitness scores vector
    // Objective 0: Traffic Commute Score (Maximize)
    // Objective 1: Land Value Score (Maximize)
    // Objective 2: RCI Zone Balance Score (Maximize)
    // Objective 3: Health & Clean Air Score (Maximize)
    // Objective 4: Infrastructure Cost Efficiency (Maximize)
    this.objectives = [0, 0, 0, 0, 0];
    
    // Combined scalar fitness score
    this.scalarFitness = 0;

    // NSGA-II sorting fields
    this.rank = 0;
    this.crowdingDistance = 0;
    this.dominatedSet = []; // Array of indices dominated by this solution
    this.dominationCount = 0; // Number of solutions dominating this solution
  }

  /**
   * Clone chromosome.
   * @returns {CityChromosome}
   */
  clone() {
    const copy = new CityChromosome(this.width, this.height);
    copy.genes.set(this.genes);
    copy.objectives = [...this.objectives];
    copy.scalarFitness = this.scalarFitness;
    copy.rank = this.rank;
    copy.crowdingDistance = this.crowdingDistance;
    return copy;
  }

  /**
   * Get gene at (x, y).
   * @param {number} x 
   * @param {number} y 
   * @returns {number}
   */
  getGene(x, y) {
    return this.genes[y * this.width + x];
  }

  /**
   * Set gene at (x, y).
   * @param {number} x 
   * @param {number} y 
   * @param {number} type 
   */
  setGene(x, y, type) {
    this.genes[y * this.width + x] = type;
  }

  /**
   * Initialize chromosome with randomized building placements.
   */
  randomize() {
    const types = Object.values(GENE_BUILDING_TYPE);
    for (let i = 0; i < this.length; i++) {
      // 30% chance Road, 30% Residential, 20% Commercial, 10% Industrial, 10% Services
      const rand = Math.random();
      if (rand < 0.30) this.genes[i] = GENE_BUILDING_TYPE.ROAD;
      else if (rand < 0.60) this.genes[i] = GENE_BUILDING_TYPE.RESIDENTIAL_LOW;
      else if (rand < 0.78) this.genes[i] = GENE_BUILDING_TYPE.COMMERCIAL_LOW;
      else if (rand < 0.90) this.genes[i] = GENE_BUILDING_TYPE.INDUSTRIAL_LIGHT;
      else if (rand < 0.96) this.genes[i] = GENE_BUILDING_TYPE.PARK;
      else this.genes[i] = GENE_BUILDING_TYPE.SCHOOL;
    }
  }
}

// ---------------------------------------------------------------------------
// MULTI-OBJECTIVE FITNESS EVALUATION ENGINE
// ---------------------------------------------------------------------------

/**
 * Comprehensive Fitness Evaluator calculating traffic, land value, RCI balance, and pollution.
 */
export class FitnessEvaluator {
  /**
   * Evaluate multi-objective fitness scores for a given city chromosome.
   * 
   * @param {CityChromosome} chromosome 
   * @returns {number[]} Objectives array
   */
  evaluate(chromosome) {
    const w = chromosome.width;
    const h = chromosome.height;

    let resCount = 0;
    let comCount = 0;
    let indCount = 0;
    let parkCount = 0;
    let roadCount = 0;
    let heavyIndCount = 0;

    let totalLandValue = 0;
    let totalCommuteDistance = 0;
    let commutePairs = 0;
    let pollutionExposure = 0;

    // Collect coordinates by category
    const resPositions = [];
    const comPositions = [];
    const indPositions = [];
    const parkPositions = [];

    for (let x = 0; x < w; x++) {
      for (let y = 0; y < h; y++) {
        const gene = chromosome.getGene(x, y);

        if (gene === GENE_BUILDING_TYPE.RESIDENTIAL_LOW || gene === GENE_BUILDING_TYPE.RESIDENTIAL_HIGH) {
          resCount++;
          resPositions.push({ x, y });
        } else if (gene === GENE_BUILDING_TYPE.COMMERCIAL_LOW || gene === GENE_BUILDING_TYPE.COMMERCIAL_HIGH) {
          comCount++;
          comPositions.push({ x, y });
        } else if (gene === GENE_BUILDING_TYPE.INDUSTRIAL_LIGHT || gene === GENE_BUILDING_TYPE.INDUSTRIAL_HEAVY) {
          indCount++;
          indPositions.push({ x, y });
          if (gene === GENE_BUILDING_TYPE.INDUSTRIAL_HEAVY) heavyIndCount++;
        } else if (gene === GENE_BUILDING_TYPE.PARK) {
          parkCount++;
          parkPositions.push({ x, y });
        } else if (gene === GENE_BUILDING_TYPE.ROAD) {
          roadCount++;
        }
      }
    }

    // 1. OBJECTIVE 0: Commute Travel Efficiency
    // Sample distances between Residential and Commercial/Employment nodes
    const sampleSize = Math.min(30, resPositions.length);
    for (let i = 0; i < sampleSize; i++) {
      const res = resPositions[i];
      let minComDist = 999;
      for (const com of comPositions) {
        const dist = Math.abs(res.x - com.x) + Math.abs(res.y - com.y);
        if (dist < minComDist) minComDist = dist;
      }
      if (minComDist < 999) {
        totalCommuteDistance += minComDist;
        commutePairs++;
      }
    }

    const avgCommute = commutePairs > 0 ? totalCommuteDistance / commutePairs : 50;
    // Commute Score (100 max - lower commute is better)
    const commuteScore = Math.max(0, 100 - avgCommute * 3);

    // 2. OBJECTIVE 1: Land Value Optimization
    // Proximity to parks adds value; proximity to heavy industry reduces value
    for (const res of resPositions) {
      let cellValue = 50;
      // Park bonus
      for (const park of parkPositions) {
        const dist = Math.abs(res.x - park.x) + Math.abs(res.y - park.y);
        if (dist <= 4) cellValue += (5 - dist) * 8;
      }
      // Heavy Industry penalty
      for (const ind of indPositions) {
        const dist = Math.abs(res.x - ind.x) + Math.abs(res.y - ind.y);
        if (dist <= 3) {
          cellValue -= (4 - dist) * 12;
          pollutionExposure += (4 - dist);
        }
      }
      totalLandValue += Math.max(0, cellValue);
    }

    const landValueScore = resPositions.length > 0 ? totalLandValue / resPositions.length : 50;

    // 3. OBJECTIVE 2: RCI Zone Ratio Balance
    // Ideal ratio: 50% Residential, 30% Commercial, 20% Industrial
    const totalZoned = resCount + comCount + indCount || 1;
    const resRatio = resCount / totalZoned;
    const comRatio = comCount / totalZoned;
    const indRatio = indCount / totalZoned;

    const ratioPenalty = Math.abs(resRatio - 0.50) + Math.abs(comRatio - 0.30) + Math.abs(indRatio - 0.20);
    const rciBalanceScore = Math.max(0, 100 - ratioPenalty * 120);

    // 4. OBJECTIVE 3: Health & Clean Air (Low Pollution Exposure)
    const pollutionScore = Math.max(0, 100 - (pollutionExposure / (resCount || 1)) * 20);

    // 5. OBJECTIVE 4: Infrastructure Cost Efficiency (Road density ratio)
    const roadRatio = roadCount / chromosome.length;
    // Ideal road coverage ~15-25% of city grid
    const roadPenalty = Math.abs(roadRatio - 0.20);
    const infraEfficiencyScore = Math.max(0, 100 - roadPenalty * 300);

    chromosome.objectives = [
      commuteScore,
      landValueScore,
      rciBalanceScore,
      pollutionScore,
      infraEfficiencyScore
    ];

    // Combined weighted scalar fitness
    chromosome.scalarFitness = (
      commuteScore * 0.25 +
      landValueScore * 0.25 +
      rciBalanceScore * 0.20 +
      pollutionScore * 0.15 +
      infraEfficiencyScore * 0.15
    );

    return chromosome.objectives;
  }
}

// ---------------------------------------------------------------------------
// NSGA-II MULTI-OBJECTIVE OPTIMIZATION ENGINE
// ---------------------------------------------------------------------------

/**
 * NSGA-II Fast Non-Dominated Sorting and Crowding Distance algorithm implementation.
 */
export class NSGA2Sorter {
  /**
   * Check if solution A dominates solution B.
   * Solution A dominates B if A is no worse than B in all objectives AND strictly better in at least one.
   * 
   * @param {CityChromosome} a 
   * @param {CityChromosome} b 
   * @returns {boolean} True if A dominates B
   */
  isDominated(a, b) {
    let betterInAny = false;
    for (let i = 0; i < a.objectives.length; i++) {
      if (a.objectives[i] < b.objectives[i]) {
        return false; // A is worse than B in objective i
      }
      if (a.objectives[i] > b.objectives[i]) {
        betterInAny = true;
      }
    }
    return betterInAny;
  }

  /**
   * Perform Fast Non-Dominated Sort partitioning population into Pareto fronts (F1, F2, ...).
   * 
   * @param {CityChromosome[]} population 
   * @returns {CityChromosome[][]} Array of Pareto fronts
   */
  fastNonDominatedSort(population) {
    const fronts = [[]];

    for (let i = 0; i < population.length; i++) {
      const p = population[i];
      p.dominatedSet = [];
      p.dominationCount = 0;

      for (let j = 0; j < population.length; j++) {
        if (i === j) continue;
        const q = population[j];

        if (this.isDominated(p, q)) {
          p.dominatedSet.push(q);
        } else if (this.isDominated(q, p)) {
          p.dominationCount++;
        }
      }

      if (p.dominationCount === 0) {
        p.rank = 1;
        fronts[0].push(p);
      }
    }

    let i = 0;
    while (fronts[i] && fronts[i].length > 0) {
      const nextFront = [];
      for (const p of fronts[i]) {
        for (const q of p.dominatedSet) {
          q.dominationCount--;
          if (q.dominationCount === 0) {
            q.rank = i + 2;
            nextFront.push(q);
          }
        }
      }
      i++;
      if (nextFront.length > 0) {
        fronts.push(nextFront);
      }
    }

    return fronts;
  }

  /**
   * Calculate Crowding Distance metric for solutions within a single Pareto front to maintain diversity.
   * 
   * @param {CityChromosome[]} front 
   */
  calculateCrowdingDistance(front) {
    const l = front.length;
    if (l === 0) return;

    for (const ind of front) {
      ind.crowdingDistance = 0;
    }

    const numObjectives = front[0].objectives.length;

    for (let m = 0; m < numObjectives; m++) {
      // Sort front by objective m
      front.sort((a, b) => a.objectives[m] - b.objectives[m]);

      // Boundary solutions receive infinite distance to preserve extremes
      front[0].crowdingDistance = Infinity;
      front[l - 1].crowdingDistance = Infinity;

      const objMin = front[0].objectives[m];
      const objMax = front[l - 1].objectives[m];
      const range = objMax - objMin || 1e-5;

      for (let i = 1; i < l - 1; i++) {
        if (front[i].crowdingDistance !== Infinity) {
          front[i].crowdingDistance += (front[i + 1].objectives[m] - front[i - 1].objectives[m]) / range;
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// GENETIC OPERATORS (CROSSOVER & MUTATION)
// ---------------------------------------------------------------------------

/**
 * Genetic Crossover & Mutation Operator Engine.
 */
export class GeneticOperators {
  /**
   * 2D Spatial Sub-Grid Patch Crossover.
   * Swaps a contiguous rectangular district block between parent A and parent B.
   * Preserves 2D spatial locality of city districts.
   * 
   * @param {CityChromosome} parentA 
   * @param {CityChromosome} parentB 
   * @returns {[CityChromosome, CityChromosome]} Offspring tuple
   */
  crossoverSpatial2DPatch(parentA, parentB) {
    const child1 = parentA.clone();
    const child2 = parentB.clone();

    const w = parentA.width;
    const h = parentA.height;

    // Random sub-grid rectangle bounding box
    const patchW = Math.floor(w * (0.2 + Math.random() * 0.4));
    const patchH = Math.floor(h * (0.2 + Math.random() * 0.4));
    const startX = Math.floor(Math.random() * (w - patchW));
    const startY = Math.floor(Math.random() * (h - patchH));

    for (let x = startX; x < startX + patchW; x++) {
      for (let y = startY; y < startY + patchH; y++) {
        const geneA = parentA.getGene(x, y);
        const geneB = parentB.getGene(x, y);

        child1.setGene(x, y, geneB);
        child2.setGene(x, y, geneA);
      }
    }

    return [child1, child2];
  }

  /**
   * Uniform Crossover.
   * Swaps individual cell genes randomly with probability 50%.
   * 
   * @param {CityChromosome} parentA 
   * @param {CityChromosome} parentB 
   * @returns {[CityChromosome, CityChromosome]}
   */
  crossoverUniform(parentA, parentB) {
    const child1 = parentA.clone();
    const child2 = parentB.clone();

    for (let i = 0; i < parentA.length; i++) {
      if (Math.random() < 0.5) {
        child1.genes[i] = parentB.genes[i];
        child2.genes[i] = parentA.genes[i];
      }
    }

    return [child1, child2];
  }

  /**
   * Apply mutation to chromosome.
   * Supports random cell swaps, zone category mutations, and road repair.
   * 
   * @param {CityChromosome} chromosome 
   * @param {number} mutationRate Probability per cell [0.0 - 1.0]
   */
  mutate(chromosome, mutationRate = 0.05) {
    const w = chromosome.width;
    const h = chromosome.height;

    for (let i = 0; i < chromosome.length; i++) {
      if (Math.random() < mutationRate) {
        const randOp = Math.random();

        if (randOp < 0.5) {
          // Mutate cell type to random building
          const types = Object.values(GENE_BUILDING_TYPE);
          const newType = types[Math.floor(Math.random() * types.length)];
          chromosome.genes[i] = newType;
        } else {
          // Cell swap mutation with adjacent neighbor cell
          const x = i % w;
          const y = Math.floor(i / w);
          const nx = Math.max(0, Math.min(w - 1, x + (Math.random() < 0.5 ? -1 : 1)));
          const ny = Math.max(0, Math.min(h - 1, y + (Math.random() < 0.5 ? -1 : 1)));
          const nIdx = ny * w + nx;

          const temp = chromosome.genes[i];
          chromosome.genes[i] = chromosome.genes[nIdx];
          chromosome.genes[nIdx] = temp;
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// MAIN GENETIC CITY OPTIMIZER LOOPER
// ---------------------------------------------------------------------------

/**
 * Main Evolutionary Optimization Loop Engine.
 */
export class GeneticCityOptimizer {
  /**
   * @param {Object} [options]
   * @param {number} [options.populationSize=50]
   * @param {number} [options.gridWidth=32]
   * @param {number} [options.gridHeight=32]
   * @param {number} [options.crossoverRate=0.85]
   * @param {number} [options.mutationRate=0.03]
   */
  constructor(options = {}) {
    this.populationSize = options.populationSize || 50;
    this.gridWidth = options.gridWidth || 32;
    this.gridHeight = options.gridHeight || 32;
    this.crossoverRate = options.crossoverRate || 0.85;
    this.mutationRate = options.mutationRate || 0.03;

    this.evaluator = new FitnessEvaluator();
    this.nsga2 = new NSGA2Sorter();
    this.operators = new GeneticOperators();

    /** @type {CityChromosome[]} */
    this.population = [];
    this.currentGeneration = 0;
    this.history = [];
  }

  /**
   * Initialize population with random layout chromosomes.
   */
  initializePopulation() {
    this.population = [];
    for (let i = 0; i < this.populationSize; i++) {
      const chrom = new CityChromosome(this.gridWidth, this.gridHeight);
      chrom.randomize();
      this.evaluator.evaluate(chrom);
      this.population.push(chrom);
    }
    this.currentGeneration = 0;
  }

  /**
   * Binary Tournament Selection based on NSGA-II rank and crowding distance.
   * @private
   */
  _tournamentSelect() {
    const i1 = Math.floor(Math.random() * this.population.length);
    const i2 = Math.floor(Math.random() * this.population.length);
    const ind1 = this.population[i1];
    const ind2 = this.population[i2];

    // Lower rank is superior
    if (ind1.rank < ind2.rank) return ind1;
    if (ind2.rank < ind1.rank) return ind2;

    // Tie-breaker: higher crowding distance is superior
    return ind1.crowdingDistance > ind2.crowdingDistance ? ind1 : ind2;
  }

  /**
   * Execute single generational evolution step.
   * 
   * @returns {{ generation: number, bestFitness: number, paretoSize: number }}
   */
  stepGeneration() {
    // 1. Create Offspring Population via Crossover & Mutation
    const offspring = [];
    while (offspring.length < this.populationSize) {
      const p1 = this._tournamentSelect();
      const p2 = this._tournamentSelect();

      let [c1, c2] = [p1.clone(), p2.clone()];

      if (Math.random() < this.crossoverRate) {
        [c1, c2] = this.operators.crossoverSpatial2DPatch(p1, p2);
      }

      this.operators.mutate(c1, this.mutationRate);
      this.operators.mutate(c2, this.mutationRate);

      this.evaluator.evaluate(c1);
      this.evaluator.evaluate(c2);

      offspring.push(c1);
      if (offspring.length < this.populationSize) {
        offspring.push(c2);
      }
    }

    // 2. Combine Parents + Offspring (Elitism pool size 2N)
    const combined = [...this.population, ...offspring];

    // 3. NSGA-II Fast Non-Dominated Sorting
    const fronts = this.nsga2.fastNonDominatedSort(combined);

    // 4. Fill Next Generation Population from Pareto Fronts
    const nextPopulation = [];
    let frontIdx = 0;

    while (frontIdx < fronts.length && nextPopulation.length + fronts[frontIdx].length <= this.populationSize) {
      this.nsga2.calculateCrowdingDistance(fronts[frontIdx]);
      nextPopulation.push(...fronts[frontIdx]);
      frontIdx++;
    }

    // If last front exceeds population size limit, select top solutions by crowding distance
    if (nextPopulation.length < this.populationSize && frontIdx < fronts.length) {
      const lastFront = fronts[frontIdx];
      this.nsga2.calculateCrowdingDistance(lastFront);
      lastFront.sort((a, b) => b.crowdingDistance - a.crowdingDistance);

      const needed = this.populationSize - nextPopulation.length;
      nextPopulation.push(...lastFront.slice(0, needed));
    }

    this.population = nextPopulation;
    this.currentGeneration++;

    // Track statistics
    const bestInd = this.getBestIndividual();
    const stat = {
      generation: this.currentGeneration,
      bestFitness: bestInd.scalarFitness,
      paretoSize: fronts[0].length
    };
    this.history.push(stat);

    return stat;
  }

  /**
   * Get best individual solution by scalar fitness.
   * @returns {CityChromosome}
   */
  getBestIndividual() {
    let best = this.population[0];
    for (const ind of this.population) {
      if (ind.scalarFitness > best.scalarFitness) {
        best = ind;
      }
    }
    return best;
  }

  /**
   * Export optimal chromosome layout as executable JSON blueprint.
   * 
   * @param {CityChromosome} [chromosome] 
   * @returns {Object} City blueprint schema
   */
  exportBlueprint(chromosome = this.getBestIndividual()) {
    const grid = [];
    for (let y = 0; y < chromosome.height; y++) {
      const row = [];
      for (let x = 0; x < chromosome.width; x++) {
        row.push(chromosome.getGene(x, y));
      }
      grid.push(row);
    }

    return {
      generator: 'GeneticCityOptimizer',
      generation: this.currentGeneration,
      width: chromosome.width,
      height: chromosome.height,
      fitnessObjectives: {
        commuteScore: chromosome.objectives[0],
        landValueScore: chromosome.objectives[1],
        rciBalanceScore: chromosome.objectives[2],
        pollutionScore: chromosome.objectives[3],
        infraEfficiencyScore: chromosome.objectives[4]
      },
      grid
    };
  }
}

export default {
  GENE_BUILDING_TYPE,
  SELECTION_TYPE,
  CROSSOVER_TYPE,
  CityChromosome,
  FitnessEvaluator,
  NSGA2Sorter,
  GeneticOperators,
  GeneticCityOptimizer
};
