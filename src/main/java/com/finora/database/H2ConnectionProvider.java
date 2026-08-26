package com.finora.database;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public final class H2ConnectionProvider implements ConnectionProvider {
    private final String url;

    public H2ConnectionProvider(Path dataDirectory) {
        Path directory = dataDirectory.toAbsolutePath().normalize();
        try {
            Files.createDirectories(directory);
        } catch (IOException exception) {
            throw new IllegalStateException("FINORA cannot create its local data directory: " + directory, exception);
        }
        String file = directory.resolve("finora").toString().replace('\\', '/');
        this.url = "jdbc:h2:file:" + file + ";MODE=MySQL;DATABASE_TO_LOWER=TRUE";
    }

    @Override public Connection getConnection() throws SQLException { return DriverManager.getConnection(url, "sa", ""); }
    @Override public DatabaseType type() { return DatabaseType.H2; }
    public String url() { return url; }
}
