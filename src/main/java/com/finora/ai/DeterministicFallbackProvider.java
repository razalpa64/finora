package com.finora.ai;

import java.util.function.Consumer;

/** Always-available private fallback; returns only context already verified by FINORA tools. */
public final class DeterministicFallbackProvider implements AIProvider {
    @Override public String generate(AIRequest request) {
        return request.messages().stream().filter(message -> "tool".equalsIgnoreCase(message.role()))
                .reduce((first,second)->second).map(AIRequest.Message::content)
                .orElse("I need a specific financial question or more recorded data before I can calculate an answer.");
    }
    @Override public void stream(AIRequest request, Consumer<String> onToken, Runnable onComplete){onToken.accept(generate(request));onComplete.run();}
    @Override public boolean isAvailable(){return true;}
    @Override public ModelInfo getModelInfo(){return ModelInfo.deterministic();}
}
