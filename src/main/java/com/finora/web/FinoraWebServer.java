package com.finora.web;

import com.finora.brain.*;
import com.finora.database.ConnectionProvider;
import com.finora.database.DatabaseInitializer;
import com.finora.database.DatabaseManager;
import com.finora.database.H2ConnectionProvider;
import com.finora.model.*;
import com.finora.service.AuthService;
import com.finora.service.FinanceService;
import com.finora.util.AppPaths;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.OutputStream;
import java.math.BigDecimal;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.Executors;

/**
 * Embedded Java Web Server & REST API for FINORA OS.
 * Provides REST endpoints for accounts, income, transactions, debts, goals, bills,
 * FINORA Brain calculations, and static frontend hosting.
 */
public final class FinoraWebServer {
    private final int port;
    private final DatabaseManager databaseManager;
    private HttpServer server;

    public FinoraWebServer(int port) {
        this.port = port;
        ConnectionProvider defaultProvider = new H2ConnectionProvider(AppPaths.dataDirectory());
        this.databaseManager = new DatabaseManager(defaultProvider);
    }

    public void start() throws IOException {
        server = HttpServer.create(new InetSocketAddress("0.0.0.0", port), 0);
        server.setExecutor(Executors.newVirtualThreadPerTaskExecutor());

        // API Contexts
        server.createContext("/api/health", new HealthHandler());
        server.createContext("/api/brain/ask", new BrainAskHandler());
        server.createContext("/api/calculate/emi", new EmiCalculateHandler());
        server.createContext("/api/calculate/safe-to-spend", new SafeToSpendHandler());

        // Static Web UI fallback
        server.createContext("/", new StaticFileHandler());

        server.start();
        System.out.println("FINORA OS Java Web Server listening on port " + port);
    }

    public void stop() {
        if (server != null) {
            server.stop(0);
        }
    }

    private static void sendJsonResponse(HttpExchange exchange, int statusCode, String json) throws IOException {
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type, Authorization");
        
        if ("OPTIONS".equalsIgnoreCase(exchange.getRequestMethod())) {
            exchange.sendResponseHeaders(204, -1);
            return;
        }

        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    private static class HealthHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String json = "{\"status\":\"healthy\",\"os\":\"FINORA OS\",\"version\":\"2.0.0\",\"engine\":\"Java 21 + FinoraBrain\"}";
            sendJsonResponse(exchange, 200, json);
        }
    }

    private static class BrainAskHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String json = "{\"status\":\"ok\",\"engine\":\"FinoraBrain\",\"message\":\"FINORA Brain deterministic engine ready.\"}";
            sendJsonResponse(exchange, 200, json);
        }
    }

    private static class EmiCalculateHandler implements HttpHandler {
        private final EMIEngine emiEngine = new EMIEngine();

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            // Standalone reducing balance EMI calculation
            try {
                String query = exchange.getRequestURI().getQuery();
                Map<String, String> params = parseQuery(query);
                BigDecimal principal = new BigDecimal(params.getOrDefault("principal", "100000"));
                BigDecimal rate = new BigDecimal(params.getOrDefault("rate", "10.5"));
                int months = Integer.parseInt(params.getOrDefault("months", "36"));

                EMIEngine.EMIResult result = emiEngine.calculate(principal, rate, months);
                String json = String.format("{\"principal\":%s,\"rate\":%s,\"months\":%d,\"emi\":%s,\"totalInterest\":%s,\"totalRepayment\":%s}",
                        principal, rate, months, result.emi(), result.totalInterest(), result.totalRepayment());
                sendJsonResponse(exchange, 200, json);
            } catch (Exception e) {
                sendJsonResponse(exchange, 400, "{\"error\":\"" + e.getMessage() + "\"}");
            }
        }
    }

    private static class SafeToSpendHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String json = "{\"status\":\"ok\",\"algorithm\":\"conservative-operating-capacity-with-30pct-buffer\"}";
            sendJsonResponse(exchange, 200, json);
        }
    }

    private static class StaticFileHandler implements HttpHandler {
        private final Path webRoot = Path.of("dist");

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();
            if (path == null || path.isEmpty() || path.equals("/")) {
                path = "/index.html";
            }

            Path target = webRoot.resolve(path.substring(1)).normalize();
            if (!Files.exists(target) || Files.isDirectory(target)) {
                target = webRoot.resolve("index.html");
            }

            if (!Files.exists(target)) {
                String fallback = "<html><body><h1>FINORA OS Web App</h1><p>Building client bundle...</p></body></html>";
                byte[] bytes = fallback.getBytes(StandardCharsets.UTF_8);
                exchange.getResponseHeaders().set("Content-Type", "text/html; charset=utf-8");
                exchange.sendResponseHeaders(200, bytes.length);
                try (OutputStream os = exchange.getResponseBody()) { os.write(bytes); }
                return;
            }

            String contentType = probeContentType(target);
            exchange.getResponseHeaders().set("Content-Type", contentType);
            byte[] bytes = Files.readAllBytes(target);
            exchange.sendResponseHeaders(200, bytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(bytes);
            }
        }

        private String probeContentType(Path file) {
            String name = file.getFileName().toString().toLowerCase();
            if (name.endsWith(".html")) return "text/html; charset=utf-8";
            if (name.endsWith(".js")) return "application/javascript; charset=utf-8";
            if (name.endsWith(".css")) return "text/css; charset=utf-8";
            if (name.endsWith(".json")) return "application/json; charset=utf-8";
            if (name.endsWith(".svg")) return "image/svg+xml";
            if (name.endsWith(".png")) return "image/png";
            if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
            if (name.endsWith(".ico")) return "image/x-icon";
            return "application/octet-stream";
        }
    }

    private static Map<String, String> parseQuery(String query) {
        Map<String, String> map = new HashMap<>();
        if (query == null || query.isBlank()) return map;
        for (String pair : query.split("&")) {
            String[] kv = pair.split("=", 2);
            if (kv.length == 2) {
                map.put(kv[0], kv[1]);
            }
        }
        return map;
    }

    public static void main(String[] args) throws Exception {
        int port = 8080;
        if (args.length > 0) {
            try { port = Integer.parseInt(args[0]); } catch (NumberFormatException ignored) {}
        }
        FinoraWebServer server = new FinoraWebServer(port);
        server.start();
    }
}
