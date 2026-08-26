package com.finora.database;

public enum DatabaseType {
    H2("Local H2", "Your private offline database"),
    MYSQL("MySQL", "Optional centralized database");

    private final String label;
    private final String description;
    DatabaseType(String label, String description) { this.label = label; this.description = description; }
    public String label() { return label; }
    public String description() { return description; }
}
