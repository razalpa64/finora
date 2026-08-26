package com.finora.database;

import com.finora.util.AppPaths;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.Objects;
import java.util.concurrent.CopyOnWriteArrayList;

public final class DatabaseManager implements ConnectionProvider {
    private static final DatabaseManager INSTANCE = new DatabaseManager();
    private final CopyOnWriteArrayList<Runnable> listeners = new CopyOnWriteArrayList<>();
    private volatile ConnectionProvider provider;

    private DatabaseManager() {
        AppPaths.migrateLegacyDatabase();
        provider = new H2ConnectionProvider(AppPaths.dataDirectory());
    }
    public static DatabaseManager getInstance() { return INSTANCE; }
    public synchronized void use(ConnectionProvider next) throws SQLException {
        Objects.requireNonNull(next);
        try (Connection connection = next.getConnection()) {
            if (!connection.isValid(5)) throw new SQLException("The selected database did not pass validation.");
        }
        DatabaseInitializer.initialize(next);
        provider = next;
        listeners.forEach(Runnable::run);
    }
    public ConnectionProvider provider() { return provider; }
    public void addSwitchListener(Runnable listener) { listeners.add(listener); }
    @Override public Connection getConnection() throws SQLException { return provider.getConnection(); }
    @Override public DatabaseType type() { return provider.type(); }
}
