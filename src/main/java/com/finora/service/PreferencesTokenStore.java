package com.finora.service;

import java.util.Optional;
import java.util.prefs.Preferences;

public final class PreferencesTokenStore implements RememberTokenStore {
    private static final String TOKEN_KEY = "remembered_session";
    private final Preferences preferences;

    public PreferencesTokenStore() {
        this(Preferences.userRoot().node("com/finora/os"));
    }

    PreferencesTokenStore(Preferences preferences) {
        this.preferences = preferences;
    }

    @Override public Optional<String> load() {
        return Optional.ofNullable(preferences.get(TOKEN_KEY, null)).filter(value -> !value.isBlank());
    }

    @Override public void save(String token) {
        preferences.put(TOKEN_KEY, token);
    }

    @Override public void clear() {
        preferences.remove(TOKEN_KEY);
    }
}
