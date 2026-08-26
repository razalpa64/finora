package com.finora.integration;

import com.finora.brain.FinoraBrain;
import com.finora.database.DatabaseInitializer;
import com.finora.database.H2ConnectionProvider;
import com.finora.model.Account;
import com.finora.model.IncomeSource;
import com.finora.service.AuthService;
import com.finora.service.BackupService;
import com.finora.service.FinanceService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.math.BigDecimal;
import java.nio.file.Path;
import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class FinoraBrainIntegrationTest {
    @TempDir Path directory;

    @Test void emptyLocalDatabaseProducesFactsWithoutInventingValues() throws Exception {
        H2ConnectionProvider provider = new H2ConnectionProvider(directory.resolve("brain-data"));
        DatabaseInitializer.initialize(provider);
        long userId = owner(provider);
        FinoraBrain brain = new FinoraBrain(new FinanceService(provider, userId));
        var state = brain.analyze();
        assertEquals(0, state.snapshot().assets().signum());
        assertEquals(0, state.snapshot().liabilities().signum());
        assertEquals(0, state.safeToSpend().today().signum());
        var response = brain.ask("How much can I spend today?");
        assertFalse(response.calculation().isEmpty());
        assertFalse(response.assumptions().isEmpty());
    }

    @Test void recurringIncomeSeparatesExpectedPlanFromReceivedCash() throws Exception {
        H2ConnectionProvider provider = new H2ConnectionProvider(directory.resolve("income-data"));
        DatabaseInitializer.initialize(provider);
        long userId = owner(provider);
        FinanceService finance = new FinanceService(provider, userId);
        long accountId = finance.addAccount("Income account", Account.AccountType.CHECKING, BigDecimal.ZERO, false);
        finance.addIncomeSource("Primary income", new BigDecimal("60000.00"), IncomeSource.Frequency.MONTHLY,
                LocalDate.now().plusDays(5), accountId, "", false);
        FinoraBrain brain = new FinoraBrain(finance);
        var planned = brain.analyze();
        assertEquals(new BigDecimal("60000.00"), planned.snapshot().expectedRecurringIncome());
        assertEquals(0, planned.snapshot().recordedIncome().signum());
        IncomeSource source = finance.incomeSources().getFirst();
        finance.recordIncome(source, LocalDate.now());
        var received = brain.analyze();
        assertEquals(new BigDecimal("60000.00"), received.snapshot().recordedIncome());
        assertEquals(new BigDecimal("60000.00"), finance.accounts().getFirst().balance());
    }

    @Test void netWorthUpdatesForRealCashMovementButNotGoalEarmarking() throws Exception {
        H2ConnectionProvider provider = new H2ConnectionProvider(directory.resolve("net-worth-data"));
        DatabaseInitializer.initialize(provider);
        long userId = owner(provider);
        FinanceService finance = new FinanceService(provider, userId);
        long accountId = finance.addAccount("Main account", Account.AccountType.CHECKING,
                new BigDecimal("10000.00"), false);
        FinoraBrain brain = new FinoraBrain(finance);
        assertEquals(new BigDecimal("10000.00"), brain.analyze().snapshot().netWorth());
        finance.addTransaction(new BigDecimal("1000.00"),
                com.finora.model.TransactionRecord.TransactionType.EXPENSE, "Essential", accountId, null,
                LocalDate.now(), "Recorded expense", "");
        assertEquals(new BigDecimal("9000.00"), brain.analyze().snapshot().netWorth());
        long goalId = finance.addGoal(new com.finora.model.Goal(0, "Planned goal",
                new BigDecimal("5000.00"), BigDecimal.ZERO, new BigDecimal("500.00"),
                LocalDate.now().plusMonths(6), com.finora.model.Goal.Priority.MEDIUM, "",
                java.time.Instant.now(), java.time.Instant.now()));
        finance.contributeToGoal(goalId, accountId, new BigDecimal("500.00"), "Planned goal");
        assertEquals(new BigDecimal("9000.00"), brain.analyze().snapshot().netWorth(),
                "Earmarking existing cash for a goal must not destroy net worth");
    }

    @Test void createsAndRestoresTimestampedBackup() throws Exception {
        H2ConnectionProvider provider = new H2ConnectionProvider(directory.resolve("backup-data"));
        DatabaseInitializer.initialize(provider);
        long userId = owner(provider);
        FinanceService finance = new FinanceService(provider, userId);
        finance.addAccount("Test account", Account.AccountType.CHECKING, new BigDecimal("100.00"), false);
        BackupService service = new BackupService(provider, directory.resolve("backups"));
        Path backup = service.backup();
        assertTrue(java.nio.file.Files.isRegularFile(backup));
        assertTrue(backup.getFileName().toString().startsWith("finora_backup_"));
        assertTrue(backup.getFileName().toString().endsWith(".zip"));
        service.restore(backup);
        assertEquals(1, finance.accounts().size());
    }

    private static long owner(H2ConnectionProvider provider) throws Exception {
        return new AuthService(provider).register("Test Owner", "test.owner", "Secure123".toCharArray()).id();
    }
}
