package com.finora.ai;

import java.util.function.Consumer;

public interface AIProvider {
    String generate(AIRequest request) throws Exception;
    void stream(AIRequest request, Consumer<String> onToken, Runnable onComplete) throws Exception;
    boolean isAvailable();
    ModelInfo getModelInfo();
}
