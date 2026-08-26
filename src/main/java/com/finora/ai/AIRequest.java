package com.finora.ai;

import java.util.List;

public record AIRequest(String systemPrompt, List<Message> messages, double temperature, int maxTokens) {
    public record Message(String role, String content) {}
}
