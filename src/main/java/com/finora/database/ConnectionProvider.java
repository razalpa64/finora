package com.finora.database;

import java.sql.Connection;
import java.sql.SQLException;

public interface ConnectionProvider {
    Connection getConnection() throws SQLException;
    DatabaseType type();
    default boolean testConnection() {
        try (Connection connection = getConnection()) { return connection.isValid(3); }
        catch (SQLException exception) { return false; }
    }
}
