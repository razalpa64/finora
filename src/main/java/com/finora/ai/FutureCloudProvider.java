package com.finora.ai;

import java.util.function.Consumer;

/** Explicitly disabled placeholder. Cloud use must be opt-in and implemented with consent controls. */
public final class FutureCloudProvider implements AIProvider {
    @Override public String generate(AIRequest request) { throw new IllegalStateException("No cloud provider is enabled."); }
    @Override public void stream(AIRequest request, Consumer<String> onToken, Runnable onComplete) { throw new IllegalStateException("No cloud provider is enabled."); }
    @Override public boolean isAvailable() { return false; }
    @Override public ModelInfo getModelInfo() { return new ModelInfo("Cloud", "Disabled", "none", false, false); }
}
