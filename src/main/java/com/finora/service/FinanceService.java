package com.finora.service;

import com.finora.dao.jdbc.JdbcFinanceDao;
import com.finora.database.ConnectionProvider;
import com.finora.database.DatabaseManager;
import com.finora.model.*;

import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.*;
import java.util.List;
import java.util.Objects;
import java.util.function.LongSupplier;

public final class FinanceService {
    private final ConnectionProvider database;
    private final JdbcFinanceDao dao;

    public FinanceService(DatabaseManager database, LongSupplier userId) {
        this((ConnectionProvider) database, userId);
    }

    public FinanceService(ConnectionProvider database, LongSupplier userId) {
        this.database = Objects.requireNonNull(database);
        this.dao = new JdbcFinanceDao(database, userId);
    }

    public FinanceService(ConnectionProvider database, long userId) {
        this(database, () -> userId);
    }

    public List<Account> accounts() throws SQLException { return dao.findAll(); }
    public List<IncomeSource> incomeSources() throws SQLException { return dao.findActiveIncomeSources(); }
    public List<TransactionRecord> transactions(YearMonth month) throws SQLException { return dao.findTransactionsBetween(month.atDay(1), month.atEndOfMonth()); }
    public List<TransactionRecord> transactions(LocalDate start, LocalDate end) throws SQLException { return dao.findTransactionsBetween(start, end); }
    public List<TransactionRecord> searchTransactions(String query, LocalDate start, LocalDate end) throws SQLException { return dao.search(query, start, end); }
    public List<Debt> debts() throws SQLException { return dao.findActiveDebts(); }
    public List<Goal> goals() throws SQLException { return dao.findActiveGoals(); }
    public List<Bill> bills(LocalDate start, LocalDate end) throws SQLException { return dao.findBillsBetween(start, end); }
    public List<Bill> subscriptions() throws SQLException { return dao.findSubscriptions(); }
    public List<Budget> budgets(YearMonth month) throws SQLException { return dao.findBudgets(month); }
    public List<Investment> investments() throws SQLException { return dao.findInvestments(); }

    public long addAccount(String name, Account.AccountType type, BigDecimal openingBalance, boolean emergencyFund) throws SQLException {
        if (name == null || name.isBlank()) throw new IllegalArgumentException("Account name is required.");
        if (openingBalance == null || openingBalance.signum() < 0 || openingBalance.scale() > 2)
            throw new IllegalArgumentException("Opening balance must be a valid non-negative amount.");
        try (Connection connection = database.getConnection()) {
            return dao.insert(new Account(0, name.trim(), type, openingBalance, "INR", emergencyFund,
                    Instant.now(), Instant.now()), connection);
        }
    }

    public long addIncomeSource(String name, BigDecimal amount, IncomeSource.Frequency frequency,
                                LocalDate nextIncomeDate, long accountId, String notes, boolean recordToday) throws SQLException {
        requirePositive(amount, "Income amount");
        if (name == null || name.isBlank()) throw new IllegalArgumentException("Income source name is required.");
        if (name.trim().length() > 160) throw new IllegalArgumentException("Income source name must be 160 characters or fewer.");
        if (notes != null && notes.length() > 1000) throw new IllegalArgumentException("Income notes must be 1,000 characters or fewer.");
        if (frequency == null) throw new IllegalArgumentException("Income frequency is required.");
        if (nextIncomeDate == null) throw new IllegalArgumentException("Next income date is required.");
        try (Connection connection = database.getConnection()) {
            connection.setAutoCommit(false);
            try {
                Instant now = Instant.now();
                IncomeSource source = new IncomeSource(0, name.trim(), amount, frequency, nextIncomeDate,
                        accountId, true, notes, now, now);
                long sourceId = dao.insertIncomeSource(source, connection);
                if (recordToday) {
                    TransactionRecord transaction = new TransactionRecord(0, amount,
                            TransactionRecord.TransactionType.INCOME, "Income", accountId, null,
                            LocalDate.now(), name.trim(), "Recorded while creating recurring income",
                            sourceId, now, now);
                    dao.insert(transaction, connection);
                    dao.adjustBalance(accountId, amount, connection);
                    LocalDate next = nextIncomeDate;
                    while (!next.isAfter(LocalDate.now())) next = source.dateAfter(next);
                    if (!next.equals(nextIncomeDate)) dao.updateNextIncomeDate(sourceId, next, connection);
                }
                connection.commit();
                return sourceId;
            } catch (Exception exception) {
                connection.rollback();
                if (exception instanceof SQLException sql) throw sql;
                throw exception;
            } finally {
                connection.setAutoCommit(true);
            }
        }
    }

    public void recordIncome(IncomeSource source, LocalDate receivedDate) throws SQLException {
        Objects.requireNonNull(source);
        LocalDate date = receivedDate == null ? LocalDate.now() : receivedDate;
        try (Connection connection = database.getConnection()) {
            connection.setAutoCommit(false);
            try {
                Instant now = Instant.now();
                TransactionRecord transaction = new TransactionRecord(0, source.amount(),
                        TransactionRecord.TransactionType.INCOME, "Income", source.accountId(), null,
                        date, source.name(), "Recorded from recurring income", source.id(), now, now);
                dao.insert(transaction, connection);
                dao.adjustBalance(source.accountId(), source.amount(), connection);
                LocalDate next = source.nextIncomeDate();
                while (!next.isAfter(date)) next = source.dateAfter(next);
                dao.updateNextIncomeDate(source.id(), next, connection);
                connection.commit();
            } catch (Exception exception) {
                connection.rollback();
                if (exception instanceof SQLException sql) throw sql;
                throw exception;
            } finally {
                connection.setAutoCommit(true);
            }
        }
    }

    public void deleteIncomeSource(long id) throws SQLException { dao.deleteIncomeSource(id); }

    public long addTransaction(BigDecimal amount, TransactionRecord.TransactionType type, String category,
                               long accountId, Long relatedAccountId, LocalDate date, String description, String notes) throws SQLException {
        requirePositive(amount, "Amount");
        if (description == null || description.isBlank()) throw new IllegalArgumentException("Description is required.");
        if (type == TransactionRecord.TransactionType.TRANSFER && relatedAccountId == null)
            throw new IllegalArgumentException("A destination account is required for a transfer.");
        try (Connection connection = database.getConnection()) {
            connection.setAutoCommit(false);
            try {
                TransactionRecord record = new TransactionRecord(0, amount, type,
                        category == null || category.isBlank() ? "Uncategorised" : category.trim(), accountId,
                        relatedAccountId, date == null ? LocalDate.now() : date, description.trim(), notes, null,
                        Instant.now(), Instant.now());
                long id = dao.insert(record, connection);
                switch (type) {
                    case INCOME -> dao.adjustBalance(accountId, amount, connection);
                    case TRANSFER -> {
                        if (accountId == relatedAccountId) throw new IllegalArgumentException("Transfer accounts must be different.");
                        dao.adjustBalance(accountId, amount.negate(), connection);
                        dao.adjustBalance(relatedAccountId, amount, connection);
                    }
                    default -> dao.adjustBalance(accountId, amount.negate(), connection);
                }
                connection.commit(); return id;
            } catch (Exception exception) {
                connection.rollback();
                if (exception instanceof SQLException sql) throw sql;
                throw exception;
            } finally { connection.setAutoCommit(true); }
        }
    }

    public void recordDebtPayment(long debtId, long accountId, BigDecimal amount, String debtName) throws SQLException {
        requirePositive(amount, "Payment");
        try (Connection connection = database.getConnection()) {
            connection.setAutoCommit(false);
            try {
                TransactionRecord tx = new TransactionRecord(0, amount, TransactionRecord.TransactionType.DEBT_PAYMENT,
                        "Debt", accountId, null, LocalDate.now(), "Payment to " + debtName, "Recorded through Debt Center",
                        debtId, Instant.now(), Instant.now());
                dao.insert(tx, connection); dao.adjustBalance(accountId, amount.negate(), connection);
                dao.reduceBalance(debtId, amount, connection); connection.commit();
            } catch (Exception exception) { connection.rollback(); if (exception instanceof SQLException sql) throw sql; throw exception; }
            finally { connection.setAutoCommit(true); }
        }
    }

    public void contributeToGoal(long goalId, long accountId, BigDecimal amount, String goalName) throws SQLException {
        requirePositive(amount, "Contribution");
        try (Connection connection = database.getConnection()) {
            connection.setAutoCommit(false);
            try {
                TransactionRecord tx = new TransactionRecord(0, amount, TransactionRecord.TransactionType.GOAL_CONTRIBUTION,
                        "Goals", accountId, null, LocalDate.now(), goalName + " contribution", null, goalId, Instant.now(), Instant.now());
                // A goal contribution earmarks money already held in the selected account.
                // It must not reduce the account balance or net worth as if the money disappeared.
                dao.insert(tx, connection);
                dao.contribute(goalId, amount, connection); connection.commit();
            } catch (Exception exception) { connection.rollback(); if (exception instanceof SQLException sql) throw sql; throw exception; }
            finally { connection.setAutoCommit(true); }
        }
    }

    public long addDebt(Debt debt) throws SQLException {
        requirePositive(debt.originalAmount(), "Original amount"); requirePositive(debt.remainingAmount(), "Remaining amount");
        if (debt.name() == null || debt.name().isBlank()) throw new IllegalArgumentException("Debt name is required.");
        return dao.insert(debt);
    }
    public long addGoal(Goal goal) throws SQLException {
        requirePositive(goal.targetAmount(), "Target");
        if (goal.name() == null || goal.name().isBlank()) throw new IllegalArgumentException("Goal name is required.");
        return dao.insert(goal);
    }
    public long addBill(Bill bill) throws SQLException {
        requirePositive(bill.amount(), "Bill amount"); return dao.insert(bill);
    }
    public void markBillPaid(long id, boolean paid) throws SQLException { dao.markPaid(id, paid); }

    private static void requirePositive(BigDecimal amount, String field) {
        if (amount == null || amount.signum() <= 0) throw new IllegalArgumentException(field + " must be greater than zero.");
        if (amount.scale() > 2) throw new IllegalArgumentException(field + " can have at most two decimal places.");
    }
}
