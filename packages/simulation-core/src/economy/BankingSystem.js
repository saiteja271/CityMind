/**
 * CITYMIND Commercial Banking & Municipal Credit Engine
 * Simulates commercial banks, personal mortgage lending, business credit,
 * reserve requirements, interest rate spreads, non-performing loans (NPL), and liquidity injections.
 */

export class CommercialBank {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.totalDeposits = 5000000;
    this.totalLoansOutstanding = 3800000;
    this.cashReserves = 1200000;
    this.reserveRequirementRatio = 0.10; // 10% cash reserve mandate
    this.lendingInterestRatePct = 6.5; // 6.5% interest on loans
    this.depositInterestRatePct = 2.0; // 2.0% interest to depositors
    this.nonPerformingLoansRatio = 0.025; // 2.5% default rate
    this.isSolvent = true;
  }

  issueMortgageLoan(citizenId, amount, termYears = 30) {
    const requiredReserve = this.totalDeposits * this.reserveRequirementRatio;
    const availableLendingCapacity = this.cashReserves - requiredReserve;

    if (availableLendingCapacity >= amount) {
      this.cashReserves -= amount;
      this.totalLoansOutstanding += amount;
      return { success: true, loanAmount: amount, interestRate: this.lendingInterestRatePct, monthlyPayment: Math.round((amount * (this.lendingInterestRatePct / 100 / 12)) / (1 - Math.pow(1 + (this.lendingInterestRatePct / 100 / 12), -termYears * 12))) };
    }
    return { success: false, reason: 'Bank reserve capacity limit reached' };
  }

  processMonthlyTick() {
    const interestIncome = (this.totalLoansOutstanding * (this.lendingInterestRatePct / 100)) / 12;
    const interestExpense = (this.totalDeposits * (this.depositInterestRatePct / 100)) / 12;
    const loanDefaults = (this.totalLoansOutstanding * (this.nonPerformingLoansRatio / 100)) / 12;

    const netInterestIncome = interestIncome - interestExpense - loanDefaults;
    this.cashReserves += netInterestIncome;

    if (this.cashReserves < this.totalDeposits * (this.reserveRequirementRatio * 0.5)) {
      this.isSolvent = false;
    }
  }

  getBankSummary() {
    return {
      name: this.name,
      totalDeposits: this.totalDeposits,
      totalLoansOutstanding: this.totalLoansOutstanding,
      cashReserves: this.cashReserves,
      reserveRatioPct: ((this.cashReserves / this.totalDeposits) * 100).toFixed(1),
      lendingRate: this.lendingInterestRatePct,
      isSolvent: this.isSolvent,
    };
  }
}

export class BankingSystem {
  constructor(simulation) {
    this.simulation = simulation;
    this.banks = new Map();
    this.centralBankBaseRate = 3.5;
    this.initializeBanks();
  }

  initializeBanks() {
    const defaultBanks = [
      { id: 'bank-01', name: 'Metropolis First National Bank' },
      { id: 'bank-02', name: 'Civic Savings & Trust' },
      { id: 'bank-03', name: 'Industrial Commercial Bank' },
    ];

    defaultBanks.forEach((b) => {
      this.banks.set(b.id, new CommercialBank(b.id, b.name));
    });
  }

  update(deltaMonths) {
    this.banks.forEach((bank) => {
      bank.processMonthlyTick();
    });
  }

  getBankingSectorSummary() {
    let totalDeposits = 0;
    let totalLoans = 0;
    let totalReserves = 0;

    this.banks.forEach((bank) => {
      totalDeposits += bank.totalDeposits;
      totalLoans += bank.totalLoansOutstanding;
      totalReserves += bank.cashReserves;
    });

    return {
      centralBankBaseRate: this.centralBankBaseRate,
      activeBanksCount: this.banks.size,
      totalDeposits,
      totalLoans,
      totalReserves,
    };
  }
}

export default BankingSystem;
