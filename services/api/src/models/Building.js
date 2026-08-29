import mongoose from 'mongoose';

/**
 * Building Mongoose Schema
 * Represents placed structures on the tile grid (houses, factories, parks, schools, etc.),
 * their employment capacity, tenant citizens, power/water consumption, and efficiency.
 */
const BuildingSchema = new mongoose.Schema(
  {
    cityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
      required: true,
      index: true
    },
    buildingTypeId: {
      type: String,
      required: true,
      index: true
    },
    name: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['residential', 'commercial', 'industrial', 'public', 'infrastructure', 'environment'],
      required: true,
      index: true
    },
    location: {
      x: { type: Number, required: true },
      y: { type: Number, required: true },
      width: { type: Number, default: 1, min: 1 },
      height: { type: Number, default: 1, min: 1 }
    },
    level: {
      type: Number,
      default: 1,
      min: 1,
      max: 5
    },
    efficiency: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    },
    health: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    },
    capacity: {
      maxResidents: { type: Number, default: 0 },
      maxEmployees: { type: Number, default: 0 },
      maxCustomers: { type: Number, default: 0 }
    },
    residents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Citizen'
      }
    ],
    employees: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Citizen'
      }
    ],
    resources: {
      powerDemand: { type: Number, default: 0 },
      powerProduction: { type: Number, default: 0 },
      waterDemand: { type: Number, default: 0 },
      waterProduction: { type: Number, default: 0 },
      pollutionOutput: { type: Number, default: 0 },
      maintenanceCost: { type: Number, default: 0 },
      taxContribution: { type: Number, default: 0 }
    },
    construction: {
      isUnderConstruction: { type: Boolean, default: false },
      progress: { type: Number, default: 100, min: 0, max: 100 },
      totalBuildTicks: { type: Number, default: 10 },
      remainingTicks: { type: Number, default: 0 }
    },
    status: {
      isOperational: { type: Boolean, default: true },
      hasPowerSupply: { type: Boolean, default: true },
      hasWaterSupply: { type: Boolean, default: true },
      isAbandoned: { type: Boolean, default: false },
      onFire: { type: Boolean, default: false }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }
  }
);

// Indexes for spatial and category lookup
BuildingSchema.index({ cityId: 1, 'location.x': 1, 'location.y': 1 });
BuildingSchema.index({ cityId: 1, category: 1 });
BuildingSchema.index({ cityId: 1, buildingTypeId: 1 });

/**
 * Virtual: Current occupancy percentage for residential/commercial buildings
 */
BuildingSchema.virtual('occupancyRate').get(function () {
  if (this.category === 'residential' && this.capacity.maxResidents > 0) {
    return Number(((this.residents.length / this.capacity.maxResidents) * 100).toFixed(1));
  }
  if (this.capacity.maxEmployees > 0) {
    return Number(((this.employees.length / this.capacity.maxEmployees) * 100).toFixed(1));
  }
  return 100;
});

/**
 * Method: Upgrade building level
 */
BuildingSchema.methods.upgradeLevel = function () {
  if (this.level < 5) {
    this.level += 1;
    this.capacity.maxResidents = Math.floor(this.capacity.maxResidents * 1.5);
    this.capacity.maxEmployees = Math.floor(this.capacity.maxEmployees * 1.5);
    this.resources.powerDemand = Math.floor(this.resources.powerDemand * 1.4);
    this.resources.waterDemand = Math.floor(this.resources.waterDemand * 1.4);
    this.resources.taxContribution = Math.floor(this.resources.taxContribution * 1.6);
  }
};

const Building = mongoose.model('Building', BuildingSchema);

export default Building;
