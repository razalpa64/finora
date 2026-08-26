package com.finora.brain;

import com.finora.model.*;
import com.finora.service.FinanceService;

import java.math.BigDecimal;
import java.sql.SQLException;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.*;

public final class CashFlowEngine {
    private static final Set<String> ESSENTIAL = Set.of("housing","utilities","groceries","transport","insurance","healthcare","education","rent","medical");

    public FinancialSnapshot snapshot(FinanceService service, LocalDate date) throws SQLException {
        YearMonth month=YearMonth.from(date);
        List<Account> accounts=service.accounts();
        List<IncomeSource> incomeSources=service.incomeSources();
        List<TransactionRecord> transactions=service.transactions(month);
        List<Debt> debts=service.debts();
        List<Goal> goals=service.goals();
        List<Bill> bills=service.bills(date,month.atEndOfMonth());
        List<Budget> budgets=service.budgets(month);
        List<Investment> investmentRecords=service.investments();
        BigDecimal assets=sum(accounts,Account::balance);
        BigDecimal cash=accounts.stream().filter(a->a.type()==Account.AccountType.CASH||a.type()==Account.AccountType.CHECKING).map(Account::balance).reduce(BigDecimal.ZERO,BigDecimal::add);
        BigDecimal emergency=accounts.stream().filter(Account::emergencyFund).map(Account::balance).reduce(BigDecimal.ZERO,BigDecimal::add);
        BigDecimal investments=accounts.stream().filter(a->a.type()==Account.AccountType.INVESTMENT).map(Account::balance).reduce(BigDecimal.ZERO,BigDecimal::add);
        BigDecimal liabilities=sum(debts,Debt::remainingAmount);
        BigDecimal recordedIncome=amountFor(transactions,TransactionRecord.TransactionType.INCOME);
        BigDecimal expectedRecurringIncome=incomeSources.stream().map(IncomeSource::monthlyEquivalent).reduce(BigDecimal.ZERO,BigDecimal::add);
        BigDecimal income=expectedRecurringIncome.signum()>0?expectedRecurringIncome:recordedIncome;
        BigDecimal expenses=amountFor(transactions,TransactionRecord.TransactionType.EXPENSE);
        BigDecimal debtPaid=transactions.stream().filter(t->t.type()==TransactionRecord.TransactionType.DEBT_PAYMENT||t.type()==TransactionRecord.TransactionType.EMI_PAYMENT).map(TransactionRecord::amount).reduce(BigDecimal.ZERO,BigDecimal::add);
        Map<String,BigDecimal> byCategory=new LinkedHashMap<>();
        transactions.stream().filter(t->t.type()==TransactionRecord.TransactionType.EXPENSE).forEach(t->byCategory.merge(t.category(),t.amount(),BigDecimal::add));
        BigDecimal essential=byCategory.entrySet().stream().filter(e->ESSENTIAL.contains(e.getKey().toLowerCase())).map(Map.Entry::getValue).reduce(BigDecimal.ZERO,BigDecimal::add);
        BigDecimal upcomingBills=bills.stream().filter(b->!b.paid()).map(Bill::amount).reduce(BigDecimal.ZERO,BigDecimal::add);
        BigDecimal upcomingDebt=debts.stream().filter(d->d.dueDate()!=null&&!d.dueDate().isBefore(date)&&!d.dueDate().isAfter(month.atEndOfMonth())).map(d->d.minimumPayment().min(d.remainingAmount())).reduce(BigDecimal.ZERO,BigDecimal::add);
        BigDecimal plannedGoals=sum(goals,Goal::monthlyContribution);
        return new FinancialSnapshot(date,assets,cash,emergency,investments,liabilities,assets.subtract(liabilities),income,recordedIncome,expectedRecurringIncome,expenses,debtPaid,essential,upcomingBills,upcomingDebt,plannedGoals,accounts,incomeSources,transactions,debts,goals,bills,budgets,investmentRecords,Map.copyOf(byCategory));
    }
    private static BigDecimal amountFor(List<TransactionRecord> records,TransactionRecord.TransactionType type){return records.stream().filter(t->t.type()==type).map(TransactionRecord::amount).reduce(BigDecimal.ZERO,BigDecimal::add);}
    private static <T> BigDecimal sum(List<T> list,java.util.function.Function<T,BigDecimal> getter){return list.stream().map(getter).reduce(BigDecimal.ZERO,BigDecimal::add);}
}
