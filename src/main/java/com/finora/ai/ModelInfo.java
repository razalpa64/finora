package com.finora.ai;

public record ModelInfo(String provider, String model, String endpoint, boolean local, boolean available) {
    public static ModelInfo deterministic() {
        return new ModelInfo("FINORA", "Deterministic Finance Engine", "embedded", true, true);
    }
}
