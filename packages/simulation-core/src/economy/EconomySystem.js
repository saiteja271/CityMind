/**
 * EconomySystem - City budget, taxes, income, expenses, business finances.
 */

import { ECONOMY, BUILDING_DEFS } from '@citymind/constants';
import { clamp } from '@citymind/utilities';

export class EconomySystem {
  constructor(simulation) {
    this.sim = simulation;
    this.budget = ECONOMY.STARTING_BUDGET;
    this.taxRate = ECONOMY.BASE_TAX_RATE;
    this.revenue = { taxes: 0, other: 0 };
    this.expenses = { maintenance: 0, services: 0, salaries: 0, other: 0 };
    this.history = [];
    this.lastMonthRevenue = 0;
    this.lastMonthExpenses = 0;
    this.businesses = new Map();
  }

  setTaxRate(rate) {
    this.taxRate = clamp(rate, ECONOMY.MIN_TAX_RATE, ECONOMY.MAX_TAX_RATE);
  }

  collectTaxes(citizens) {
    let total = 0;
    for (const c of citizens) {
      if (c.alive && c.income > 0) {
        const tax = c.income * this.taxRate;
        total += tax;
        c.wealth = Math.max(0, c.wealth - tax / 12);
      }
    }
    this.revenue.taxes = total / 12;
    return this.revenue.taxes;
  }

  calculateMaintenance(buildings) {
    let total = 0;
    for (const b of buildings) {
      const def = BUILDING_DEFS[b.type];
      if (def) {
        total += (def.maintenance || 0) * ECONOMY.MAINTENANCE_MULTIPLIER;
      }
    }
    this.expenses.maintenance = total;
    return total;
  }

  payCitizenIncomes(citizens) {
    for (const c of citizens) {
      if (c.alive && c.income > 0) {
        c.wealth += c.income / 12;
      } else if (c.alive && c.isAdult && !c.isRetired && !c.isEmployed) {
        c.wealth += ECONOMY.UNEMPLOYMENT_BENEFIT / 12;
        this.expenses.other += ECONOMY.UNEMPLOYMENT_BENEFIT / 12;
      }
    }
  }

  monthlyTick(citizens, buildings) {
    this.revenue = { taxes: 0, other: 0 };
    this.expenses = { maintenance: 0, services: 0, salaries: 0, other: 0 };

    this.collectTaxes(citizens);
    this.calculateMaintenance(buildings);
    this.payCitizenIncomes(citizens);

    // Service costs based on public buildings
    const publicBuildings = buildings.filter(
      (b) => BUILDING_DEFS[b.type]?.category === 'public'
    );
    this.expenses.services = publicBuildings.length * 500;

    const totalRevenue = this.revenue.taxes + this.revenue.other;
    const totalExpenses =
      this.expenses.maintenance +
      this.expenses.services +
      this.expenses.salaries +
      this.expenses.other;

    this.budget += totalRevenue - totalExpenses;
    this.lastMonthRevenue = totalRevenue;
    this.lastMonthExpenses = totalExpenses;

    this.history.push({
      tick: this.sim?.time?.totalTicks || 0,
      budget: this.budget,
      revenue: totalRevenue,
      expenses: totalExpenses,
      taxRate: this.taxRate
    });
    if (this.history.length > 120) this.history.shift();

    return { revenue: totalRevenue, expenses: totalExpenses, budget: this.budget };
  }

  canAfford(cost) {
    return this.budget >= cost;
  }

  spend(cost) {
    if (!this.canAfford(cost)) return false;
    this.budget -= cost;
    return true;
  }

  getStats() {
    return {
      budget: this.budget,
      taxRate: this.taxRate,
      lastMonthRevenue: this.lastMonthRevenue,
      lastMonthExpenses: this.lastMonthExpenses,
      netIncome: this.lastMonthRevenue - this.lastMonthExpenses,
      history: this.history.slice(-24)
    };
  }

  toJSON() {
    return {
      budget: this.budget,
      taxRate: this.taxRate,
      history: this.history,
      lastMonthRevenue: this.lastMonthRevenue,
      lastMonthExpenses: this.lastMonthExpenses
    };
  }

  static fromJSON(data, simulation) {
    const sys = new EconomySystem(simulation);
    Object.assign(sys, data);
    return sys;
  }
}

export default EconomySystem;
