import type { Debt } from "./types";

export interface PayoffProjection {
  month: string;
  date: Date;
  balances: Record<string, number>;
  totalBalance: number;
  interestPaid: number;
  principalPaid: number;
}

export interface AvalancheResult {
  projections: PayoffProjection[];
  debtFreeDate: Date;
  totalInterestPaid: number;
  totalInterestMinOnly: number;
  interestSaved: number;
  monthsToPayoff: number;
  payoffOrder: string[];
}

export function calculateAvalanchePayoff(
  debts: Debt[],
  monthlyExtra: number
): AvalancheResult {
  // Sort by APR descending (avalanche method)
  const sorted = [...debts]
    .filter((d) => !d.is_paid_off && d.balance > 0)
    .sort((a, b) => b.apr - a.apr);

  if (sorted.length === 0) {
    return {
      projections: [],
      debtFreeDate: new Date(),
      totalInterestPaid: 0,
      totalInterestMinOnly: 0,
      interestSaved: 0,
      monthsToPayoff: 0,
      payoffOrder: [],
    };
  }

  const balances: Record<string, number> = {};
  sorted.forEach((d) => (balances[d.id] = d.balance));

  const projections: PayoffProjection[] = [];
  let totalInterestPaid = 0;
  const payoffOrder: string[] = [];
  const now = new Date();
  let month = 0;
  const maxMonths = 360; // 30 year safety cap

  // Initial snapshot
  projections.push({
    month: formatMonth(now),
    date: new Date(now),
    balances: { ...balances },
    totalBalance: Object.values(balances).reduce((s, b) => s + b, 0),
    interestPaid: 0,
    principalPaid: 0,
  });

  while (Object.values(balances).some((b) => b > 0.01) && month < maxMonths) {
    month++;
    const date = new Date(now.getFullYear(), now.getMonth() + month, 1);
    let monthInterest = 0;
    let monthPrincipal = 0;

    // Apply interest
    sorted.forEach((d) => {
      if (balances[d.id] > 0) {
        const interest = balances[d.id] * (d.apr / 100 / 12);
        balances[d.id] += interest;
        monthInterest += interest;
      }
    });

    // Apply minimum payments
    let extraPool = monthlyExtra;
    sorted.forEach((d) => {
      if (balances[d.id] > 0) {
        const payment = Math.min(d.min_payment, balances[d.id]);
        balances[d.id] -= payment;
        monthPrincipal += payment;
        if (balances[d.id] <= 0.01) {
          balances[d.id] = 0;
          if (!payoffOrder.includes(d.id)) payoffOrder.push(d.id);
          extraPool += d.min_payment; // freed-up minimum goes to extra
        }
      }
    });

    // Apply extra payment to highest APR with remaining balance
    for (const d of sorted) {
      if (balances[d.id] > 0 && extraPool > 0) {
        const payment = Math.min(extraPool, balances[d.id]);
        balances[d.id] -= payment;
        monthPrincipal += payment;
        extraPool -= payment;
        if (balances[d.id] <= 0.01) {
          balances[d.id] = 0;
          if (!payoffOrder.includes(d.id)) payoffOrder.push(d.id);
          extraPool += d.min_payment;
        }
      }
    }

    totalInterestPaid += monthInterest;

    projections.push({
      month: formatMonth(date),
      date,
      balances: { ...balances },
      totalBalance: Object.values(balances).reduce((s, b) => s + b, 0),
      interestPaid: monthInterest,
      principalPaid: monthPrincipal,
    });
  }

  // Calculate minimum-only scenario
  const totalInterestMinOnly = calculateMinOnlyInterest(sorted);

  return {
    projections,
    debtFreeDate: projections[projections.length - 1].date,
    totalInterestPaid,
    totalInterestMinOnly,
    interestSaved: totalInterestMinOnly - totalInterestPaid,
    monthsToPayoff: month,
    payoffOrder,
  };
}

function calculateMinOnlyInterest(debts: Debt[]): number {
  const balances: Record<string, number> = {};
  debts.forEach((d) => (balances[d.id] = d.balance));
  let totalInterest = 0;
  let month = 0;
  const maxMonths = 600;

  while (Object.values(balances).some((b) => b > 0.01) && month < maxMonths) {
    month++;
    debts.forEach((d) => {
      if (balances[d.id] > 0) {
        const interest = balances[d.id] * (d.apr / 100 / 12);
        balances[d.id] += interest;
        totalInterest += interest;
        const payment = Math.min(d.min_payment, balances[d.id]);
        balances[d.id] -= payment;
        if (balances[d.id] <= 0.01) balances[d.id] = 0;
      }
    });
  }
  return totalInterest;
}

function formatMonth(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

export function calculateFinancialHealthScore(params: {
  debtRatio: number; // total debt / annual income
  savingsRate: number; // monthly savings / monthly income
  emergencyFundRatio: number; // emergency fund / (6 months expenses)
  insuranceCoverage: number; // current coverage / recommended
  estatePlanComplete: number; // 0-1 completion
}): number {
  const { debtRatio, savingsRate, emergencyFundRatio, insuranceCoverage, estatePlanComplete } = params;

  // Each category is 0-20 points, total 100
  const debtScore = Math.max(0, Math.min(20, 20 * (1 - debtRatio)));
  const savingsScore = Math.min(20, savingsRate * 100); // 20% savings rate = full score
  const efScore = Math.min(20, emergencyFundRatio * 20);
  const insuranceScore = Math.min(20, insuranceCoverage * 20);
  const estateScore = estatePlanComplete * 20;

  return Math.round(debtScore + savingsScore + efScore + insuranceScore + estateScore);
}

export function getCurrentPhase(params: {
  hasLifeInsurance: boolean;
  hasPasswordManager: boolean;
  hasEstateDocuments: boolean;
  debtBalance: number;
  emergencyFund: number;
  emergencyFundTarget: number;
}): number {
  const { hasLifeInsurance, hasPasswordManager, hasEstateDocuments, debtBalance, emergencyFund, emergencyFundTarget } = params;

  if (!hasLifeInsurance || !hasPasswordManager) return 1;
  if (!hasEstateDocuments || debtBalance > 0) return 2;
  if (emergencyFund < emergencyFundTarget) return 3;
  return 4;
}
