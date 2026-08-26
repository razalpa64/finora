package com.finora.database;

import com.finora.dao.jdbc.JdbcFinanceDao;
import com.finora.service.AuthService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.math.BigDecimal;
import java.nio.file.Path;
import java.sql.PreparedStatement;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.YearMonth;

import static org.junit.jupiter.api.Assertions.*;

class DatabaseInitializerTest {
    @TempDir Path directory;

    @Test void initializesAnEmptyWorkspaceAndNeverSeedsFinancialData() throws Exception {
        H2ConnectionProvider provider = new H2ConnectionProvider(directory);
        DatabaseInitializer.initialize(provider);
        long userId = new AuthService(provider).register("Local User", "local.user", "Secure123".toCharArray()).id();
        JdbcFinanceDao dao = new JdbcFinanceDao(provider, userId);
        assertTrue(dao.findAll().isEmpty());
        assertTrue(dao.findActiveIncomeSources().isEmpty());
        assertTrue(dao.findActiveDebts().isEmpty());
        assertTrue(dao.findActiveGoals().isEmpty());
        assertTrue(dao.findTransactionsBetween(YearMonth.now().atDay(1), YearMonth.now().atEndOfMonth()).isEmpty());
        DatabaseInitializer.initialize(provider);
        assertTrue(dao.findAll().isEmpty(), "Repeated initialization must not add sample accounts");
    }

    @Test void removesOnlyAWorkspaceExplicitlyMarkedAsLegacyDemo() throws Exception {
        H2ConnectionProvider provider = new H2ConnectionProvider(directory);
        DatabaseInitializer.initialize(provider);
        long userId = new AuthService(provider).register("Local User", "demo.owner", "Secure123".toCharArray()).id();
        try (var connection = provider.getConnection()) {
            try (PreparedStatement account = connection.prepareStatement(
                    "INSERT INTO accounts(user_id,name,account_type,balance,currency,emergency_fund,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)")) {
                account.setLong(1, userId);
                account.setString(2, "Legacy placeholder");
                account.setString(3, "CHECKING");
                account.setBigDecimal(4, new BigDecimal("1.00"));
                account.setString(5, "INR");
                account.setBoolean(6, false);
                account.setTimestamp(7, Timestamp.from(Instant.now()));
                account.setTimestamp(8, Timestamp.from(Instant.now()));
                account.executeUpdate();
            }
            try (PreparedStatement mode = connection.prepareStatement(
                    "UPDATE app_settings SET setting_value='DEMO' WHERE setting_key='workspace_mode'")) {
                mode.executeUpdate();
            }
        }
        DatabaseInitializer.initialize(provider);
        assertTrue(new JdbcFinanceDao(provider, userId).findAll().isEmpty());
    }

    @Test void differentProfilesCanUseSameBudgetCategoryAndMonth() throws Exception {
        H2ConnectionProvider provider = new H2ConnectionProvider(directory);
        DatabaseInitializer.initialize(provider);
        AuthService auth = new AuthService(provider);
        long first = auth.register("First Owner", "budget.one", "Secure123".toCharArray()).id();
        long second = auth.register("Second Owner", "budget.two", "Secure456".toCharArray()).id();
        try (var connection=provider.getConnection(); PreparedStatement insert=connection.prepareStatement(
                "INSERT INTO budgets(user_id,category,limit_amount,month_key,deleted,created_at,updated_at) VALUES(?,?,?, ?,FALSE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)")) {
            for (long user : new long[]{first,second}) {
                insert.setLong(1,user);insert.setString(2,"Food");insert.setBigDecimal(3,new BigDecimal("100.00"));insert.setString(4,YearMonth.now().toString());insert.executeUpdate();
            }
        }
        assertEquals(1,new JdbcFinanceDao(provider,first).findBudgets(YearMonth.now()).size());
        assertEquals(1,new JdbcFinanceDao(provider,second).findBudgets(YearMonth.now()).size());
    }

    @Test void migratesUnscopedLegacyRowsToOriginalOwner() throws Exception {
        H2ConnectionProvider provider = new H2ConnectionProvider(directory);
        DatabaseInitializer.initialize(provider);
        long owner = new AuthService(provider).register("Original Owner", "original.owner", "Secure123".toCharArray()).id();
        try (var connection = provider.getConnection(); var statement = connection.createStatement()) {
            statement.execute("DROP INDEX idx_accounts_user");
            statement.execute("ALTER TABLE accounts DROP COLUMN user_id");
            statement.execute("INSERT INTO accounts(name,account_type,balance,currency,emergency_fund,deleted,created_at,updated_at) VALUES('Existing account','CHECKING',25,'INR',FALSE,FALSE,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP)");
        }
        DatabaseInitializer.initialize(provider);
        assertEquals(1, new JdbcFinanceDao(provider, owner).findAll().size());
    }
}
