package com.finora.model;

import java.time.Instant;

public record UserProfile(long id, String displayName, String username, Instant createdAt, Instant lastLoginAt) {
    public String initials() {
        String[] parts = displayName.trim().split("\\s+");
        if (parts.length == 0 || parts[0].isBlank()) return "U";
        String first = parts[0].substring(0, 1);
        String second = parts.length > 1 ? parts[parts.length - 1].substring(0, 1) : "";
        return (first + second).toUpperCase();
    }
}
