package com.finora.brain;

import com.finora.model.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public record FinancialSnapshot(
        LocalDate asOf, BigDecimal assets, BigDecimal cash, BigDecimal emergencyFund, BigDecimal investments,
        BigDecimal liabilities, BigDecimal netWorth, BigDecimal monthlyIncome, BigDecimal recordedIncome,
        BigDecimal expectedRecurringIncome, BigDecimal monthlyExpenses, BigDecimal monthlyDebtPayments,
        BigDecimal essentialExpenses, BigDecimal upcomingBills, BigDecimal upcomingDebtCommitments,
        BigDecimal plannedGoalContributions, List<Account> accounts, List<IncomeSource> incomeSources,
        List<TransactionRecord> transactions, List<Debt> debts, List<Goal> goals, List<Bill> bills,
        List<Budget> budgets, List<Investment> investmentRecords, Map<String, BigDecimal> expenseByCategory) {
    public BigDecimal monthlyOutflow() { return monthlyExpenses.add(monthlyDebtPayments); }
    public boolean usesRecurringIncomePlan() { return expectedRecurringIncome.signum() > 0; }
}
