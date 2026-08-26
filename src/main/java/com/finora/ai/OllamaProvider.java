package com.finora.ai;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.function.Consumer;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class OllamaProvider implements AIProvider {
    private static final Pattern RESPONSE = Pattern.compile("\\\"response\\\"\\s*:\\s*\\\"((?:\\\\.|[^\\\"])*)\\\"");
    private final String endpoint;
    private final String model;
    private final HttpClient client;

    public OllamaProvider(String endpoint, String model) {
        this.endpoint = normalizeEndpoint(endpoint == null || endpoint.isBlank() ? "http://127.0.0.1:11434" : endpoint);
        this.model = model == null || model.isBlank() ? "llama3.2:3b" : model.trim();
        this.client = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(1)).build();
    }

    @Override public String generate(AIRequest request) throws Exception {
        String body = "{\"model\":\"" + escape(model) + "\",\"stream\":false,\"prompt\":\"" +
                escape(prompt(request)) + "\",\"options\":{\"temperature\":" + request.temperature() + "}}";
        HttpResponse<String> response = client.send(HttpRequest.newBuilder(URI.create(endpoint + "/api/generate"))
                .timeout(Duration.ofMinutes(3)).header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(body)).build(), HttpResponse.BodyHandlers.ofString());
        if (response.statusCode() / 100 != 2) throw new IllegalStateException("Local model returned HTTP " + response.statusCode());
        Matcher matcher = RESPONSE.matcher(response.body());
        if (!matcher.find()) throw new IllegalStateException("Local model returned an unreadable response.");
        return unescape(matcher.group(1)).trim();
    }

    @Override public void stream(AIRequest request, Consumer<String> onToken, Runnable onComplete) throws Exception {
        String body = "{\"model\":\"" + escape(model) + "\",\"stream\":true,\"prompt\":\"" +
                escape(prompt(request)) + "\",\"options\":{\"temperature\":" + request.temperature() + "}}";
        HttpResponse<java.util.stream.Stream<String>> response = client.send(
                HttpRequest.newBuilder(URI.create(endpoint + "/api/generate")).timeout(Duration.ofMinutes(3))
                        .header("Content-Type", "application/json").POST(HttpRequest.BodyPublishers.ofString(body)).build(),
                HttpResponse.BodyHandlers.ofLines());
        if (response.statusCode() / 100 != 2) throw new IllegalStateException("Local model returned HTTP " + response.statusCode());
        try (var lines = response.body()) {
            lines.forEach(line -> {
                Matcher matcher = RESPONSE.matcher(line);
                if (matcher.find()) onToken.accept(unescape(matcher.group(1)));
            });
        }
        onComplete.run();
    }

    @Override public boolean isAvailable() {
        try {
            HttpResponse<Void> response = client.send(HttpRequest.newBuilder(URI.create(endpoint + "/api/tags"))
                    .timeout(Duration.ofMillis(750)).GET().build(), HttpResponse.BodyHandlers.discarding());
            return response.statusCode() / 100 == 2;
        } catch (Exception ignored) {
            return false;
        }
    }

    @Override public ModelInfo getModelInfo() {
        return new ModelInfo("Ollama", model, endpoint, true, isAvailable());
    }

    private static String prompt(AIRequest request) {
        StringBuilder value = new StringBuilder(request.systemPrompt()).append("\n\n");
        for (AIRequest.Message message : request.messages())
            value.append(message.role().toUpperCase()).append(": ").append(message.content()).append("\n");
        value.append("ASSISTANT:");
        return value.toString();
    }

    private static String normalizeEndpoint(String value) {
        String clean = value.trim();
        while (clean.endsWith("/")) clean = clean.substring(0, clean.length() - 1);
        return clean;
    }
    private static String escape(String value) { return value.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n").replace("\r", ""); }
    private static String unescape(String value) { return value.replace("\\n", "\n").replace("\\r", "").replace("\\\"", "\"").replace("\\\\", "\\"); }
}
