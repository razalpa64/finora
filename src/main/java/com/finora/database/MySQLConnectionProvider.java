package com.finora.database;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.util.Objects;

public final class MySQLConnectionProvider implements ConnectionProvider {
    private final String url;
    private final String username;
    private final char[] password;

    public MySQLConnectionProvider(String host, int port, String database, String username, char[] password) {
        this.url = "jdbc:mysql://" + Objects.requireNonNull(host) + ":" + port + "/" + Objects.requireNonNull(database)
                + "?sslMode=REQUIRED&serverTimezone=UTC&allowPublicKeyRetrieval=false";
        this.username = Objects.requireNonNull(username);
        this.password = password == null ? new char[0] : password.clone();
    }

    @Override public Connection getConnection() throws SQLException {
        return DriverManager.getConnection(url, username, new String(password));
    }
    @Override public DatabaseType type() { return DatabaseType.MYSQL; }
}
