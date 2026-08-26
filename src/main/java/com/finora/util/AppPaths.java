package com.finora.util;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;

public final class AppPaths {
    private AppPaths() {
    }

    public static Path home() {
        String override = System.getProperty("finora.home");
        if (override != null && !override.isBlank()) return Path.of(override).toAbsolutePath();
        String os = System.getProperty("os.name", "").toLowerCase(Locale.ROOT);
        String userHome = System.getProperty("user.home");
        if (os.contains("win")) {
            String local = System.getenv("LOCALAPPDATA");
            return Path.of(local == null || local.isBlank() ? userHome : local, "FINORA");
        }
        if (os.contains("mac")) return Path.of(userHome, "Library", "Application Support", "FINORA");
        String xdg = System.getenv("XDG_DATA_HOME");
        return xdg == null || xdg.isBlank()
                ? Path.of(userHome, ".local", "share", "finora")
                : Path.of(xdg, "finora");
    }

    public static Path dataDirectory() { return home().resolve("data"); }
    public static Path backupDirectory() { return home().resolve("backups"); }

    /** Copies the previous working-directory database into the stable OS data location once. */
    public static void migrateLegacyDatabase() {
        Path legacy = Path.of("data", "finora.mv.db").toAbsolutePath().normalize();
        Path destination = dataDirectory().resolve("finora.mv.db").toAbsolutePath().normalize();
        if (legacy.equals(destination) || !Files.isRegularFile(legacy) || Files.exists(destination)) return;
        try {
            Files.createDirectories(destination.getParent());
            Files.copy(legacy, destination, StandardCopyOption.COPY_ATTRIBUTES);
        } catch (IOException exception) {
            throw new IllegalStateException("FINORA could not migrate the previous local database.", exception);
        }
    }
}
