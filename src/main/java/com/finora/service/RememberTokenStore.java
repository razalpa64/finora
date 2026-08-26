package com.finora.service;

import java.util.Optional;

public interface RememberTokenStore {
    Optional<String> load();
    void save(String token);
    void clear();
}
