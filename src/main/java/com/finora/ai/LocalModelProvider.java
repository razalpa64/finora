package com.finora.ai;

import java.net.URI;
import java.net.http.*;
import java.time.Duration;
import java.util.function.Consumer;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/** Provider for a local llama.cpp-compatible /completion server. */
public final class LocalModelProvider implements AIProvider {
    private static final Pattern CONTENT = Pattern.compile("\\\"content\\\"\\s*:\\s*\\\"((?:\\\\.|[^\\\"])*)\\\"");
    private final String endpoint;
    private final String modelName;
    private final HttpClient client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(1)).build();

    public LocalModelProvider(String endpoint, String modelName) {
        this.endpoint = (endpoint == null || endpoint.isBlank() ? "http://127.0.0.1:8080" : endpoint).replaceAll("/+$", "");
        this.modelName = modelName == null || modelName.isBlank() ? "Local GGUF" : modelName;
    }

    @Override public String generate(AIRequest request) throws Exception {
        StringBuilder prompt = new StringBuilder(request.systemPrompt()).append("\n\n");
        request.messages().forEach(message -> prompt.append(message.role()).append(": ").append(message.content()).append('\n'));
        String body = "{\"prompt\":\"" + escape(prompt.toString()) + "\",\"n_predict\":" + request.maxTokens() +
                ",\"temperature\":" + request.temperature() + ",\"stream\":false}";
        HttpResponse<String> response = client.send(HttpRequest.newBuilder(URI.create(endpoint + "/completion"))
                .timeout(Duration.ofMinutes(3)).header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body)).build(), HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() / 100 != 2) throw new IllegalStateException("Local model returned HTTP " + response.statusCode());
        Matcher matcher = CONTENT.matcher(response.body());
        if (!matcher.find()) throw new IllegalStateException("Local model returned an unreadable response.");
        return matcher.group(1).replace("\\n", "\n").replace("\\\"", "\"").replace("\\\\", "\\").trim();
    }

    @Override public void stream(AIRequest request, Consumer<String> onToken, Runnable onComplete) throws Exception {
        // Compatibility fallback: providers without line-stream support still satisfy the streaming contract.
        onToken.accept(generate(request));
        onComplete.run();
    }
    @Override public boolean isAvailable() {
        try {
            return client.send(HttpRequest.newBuilder(URI.create(endpoint + "/health"))
                    .timeout(Duration.ofMillis(750)).GET().build(), HttpResponse.BodyHandlers.discarding()).statusCode() / 100 == 2;
        } catch (Exception ignored) { return false; }
    }
    @Override public ModelInfo getModelInfo() { return new ModelInfo("llama.cpp", modelName, endpoint, true, isAvailable()); }
    private static String escape(String value) { return value.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", ""); }
}
