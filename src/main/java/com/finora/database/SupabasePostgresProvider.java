package com.finora.database;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Objects;

/**
 * Supabase Postgres connection provider.
 * Supports connecting to Supabase via Direct connection or Connection Pooler (Transaction / Session mode).
 */
public final class SupabasePostgresProvider implements ConnectionProvider {
    private final String url;
    private final String user;
    private final String password;

    public SupabasePostgresProvider(String host, int port, String database, String user, String password) {
        Objects.requireNonNull(host, "Supabase host is required");
        Objects.requireNonNull(database, "Supabase database name is required");
        Objects.requireNonNull(user, "Supabase user is required");
        this.user = user;
        this.password = password == null ? "" : password;
        // Standard PostgreSQL JDBC connection string with SSL enabled
        this.url = String.format("jdbc:postgresql://%s:%d/%s?sslmode=require&prepareThreshold=0", host, port, database);
    }

    public SupabasePostgresProvider(String connectionString) {
        Objects.requireNonNull(connectionString, "Supabase connection string is required");
        this.url = connectionString.startsWith("jdbc:") ? connectionString : "jdbc:" + connectionString;
        this.user = null;
        this.password = null;
    }

    @Override
    public Connection getConnection() throws SQLException {
        if (user != null) {
            return DriverManager.getConnection(url, user, password);
        }
        return DriverManager.getConnection(url);
    }

    @Override
    public DatabaseType type() {
        return DatabaseType.MYSQL; // Relational SQL mode
    }

    @Override
    public void close() {
        // Driver connections close per request
    }
}
