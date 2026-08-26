package com.finora;

import javafx.application.Application;

/**
 * Classpath-safe entry point for the packaged executable JAR.
 *
 * Keeping the manifest main class separate from the Application subclass prevents
 * the JDK launcher from looking for JavaFX inside the JDK before Maven-provided
 * JavaFX modules have been loaded from the application JAR.
 */
public final class Launcher {
    private Launcher() {
    }

    public static void main(String[] args) {
        Application.launch(Main.class, args);
    }
}
