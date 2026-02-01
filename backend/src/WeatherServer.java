import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

import java.io.*;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.URLEncoder;
import java.net.URLDecoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

/**
 * WeatherServer: A lightweight Full-Stack entry point.
 * Handles both API requests and static file serving for the React frontend.
 */
public class WeatherServer {
    private static final int PORT = 8000;
    private static final HttpClient httpClient = HttpClient.newHttpClient();

    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress(PORT), 0);

        // Define Application Routes
        server.createContext("/api/weather", new WeatherApiHandler()); // Weather Data API
        server.createContext("/", new StaticHandler());               // Static Web Assets

        server.setExecutor(null);
        System.out.println("Server started successfully at http://localhost:" + PORT);
        server.start();
    }

    // --- Section 1: Weather API Management (Backend Logic) ---
    static class WeatherApiHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            // Only allow GET requests for the weather API
            if (!"GET".equalsIgnoreCase(exchange.getRequestMethod())) {
                sendResponse(exchange, 405, "Method Not Allowed. Only GET is supported.");
                return;
            }

            String city = getCityFromQuery(exchange.getRequestURI());
            if (city == null || city.isBlank()) {
                sendResponse(exchange, 400, "City parameter is missing or empty.");
                return;
            }

            try {
                // 1. Fetch Geocoding data (Convert city name to coordinates)
                Map<String, Double> coords = getCoordinates(city);
                if (coords == null) {
                    sendResponse(exchange, 404, "City coordinates not found.");
                    return;
                }

                // 2. Fetch Meteorological data based on coordinates
                String forecast = fetchForecast(coords.get("lat"), coords.get("lon"));

                exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
                sendResponse(exchange, 200, forecast);

            } catch (Exception e) {
                e.printStackTrace();
                sendResponse(exchange, 500, "Internal Server Error: " + e.getMessage());
            }
        }

        private String getCityFromQuery(URI uri) {
            return queryToMap(uri).get("city");
        }

        private Map<String, Double> getCoordinates(String city) throws Exception {
            String q = URLEncoder.encode(city, "UTF-8");
            String url = "https://geocoding-api.open-meteo.com/v1/search?name=" + q + "&count=1";

            String responseBody = callExternalApi(url);
            if (responseBody == null) return null;

            Double lat = extractNumber(responseBody, "latitude");
            Double lon = extractNumber(responseBody, "longitude");

            if (lat == null || lon == null) return null;
            return Map.of("lat", lat, "lon", lon);
        }

        private String fetchForecast(double lat, double lon) throws Exception {
            String url = String.format("https://api.open-meteo.com/v1/forecast?latitude=%s&longitude=%s&current_weather=true&timezone=auto", lat, lon);
            return callExternalApi(url);
        }

        private String callExternalApi(String url) throws Exception {
            HttpRequest req = HttpRequest.newBuilder().uri(URI.create(url)).GET().build();
            HttpResponse<String> resp = httpClient.send(req, HttpResponse.BodyHandlers.ofString());
            return resp.statusCode() == 200 ? resp.body() : null;
        }
    }

    // --- Section 2: Frontend Asset Management (Static Files) ---
    static class StaticHandler implements HttpHandler {
        private final Path base;

        StaticHandler() {
            /**
             * Resolving the frontend directory path.
             * In IntelliJ, the project usually runs from the root directory.
             */
            this.base = Paths.get("frontend").toAbsolutePath().normalize();
            System.out.println("Serving static assets from: " + base);
        }

        @Override
        public void handle(HttpExchange exchange) throws IOException {
            String path = exchange.getRequestURI().getPath();

            // Default to index.html for root requests
            if (path.equals("/")) path = "/index.html";

            Path filePath = base.resolve(path.substring(1)).normalize();

            // Safety check: ensure the requested file exists and is not a directory
            if (!Files.exists(filePath) || Files.isDirectory(filePath)) {
                filePath = base.resolve("index.html");
            }

            if (!Files.exists(filePath)) {
                sendResponse(exchange, 404, "404 - Asset Not Found");
                return;
            }

            // Set appropriate MIME type based on file extension
            String contentType = guessMimeType(filePath.toString());
            exchange.getResponseHeaders().set("Content-Type", contentType);

            byte[] bytes = Files.readAllBytes(filePath);
            exchange.sendResponseHeaders(200, bytes.length);
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(bytes);
            }
        }

        private String guessMimeType(String fileName) {
            if (fileName.endsWith(".html")) return "text/html; charset=utf-8";
            if (fileName.endsWith(".js")) return "text/javascript; charset=utf-8";
            if (fileName.endsWith(".css")) return "text/css; charset=utf-8";
            return "application/octet-stream";
        }
    }

    // --- Utility Methods: Shared Helper Functions ---

    /**
     * Sends an HTTP response with the specified status code and body.
     */
    private static void sendResponse(HttpExchange exchange, int code, String body) throws IOException {
        byte[] bytes = body.getBytes("UTF-8");
        exchange.sendResponseHeaders(code, bytes.length);
        try (OutputStream os = exchange.getResponseBody()) {
            os.write(bytes);
        }
    }

    /**
     * Parses URI query parameters into a usable Map.
     */
    private static Map<String, String> queryToMap(URI uri) {
        Map<String, String> map = new HashMap<>();
        String query = uri.getRawQuery();
        if (query == null) return map;
        for (String pair : query.split("&")) {
            String[] kv = pair.split("=");
            try {
                String key = URLDecoder.decode(kv[0], "UTF-8");
                String value = kv.length > 1 ? URLDecoder.decode(kv[1], "UTF-8") : "";
                map.put(key, value);
            } catch (Exception ignored) {}
        }
        return map;
    }

    /**
     * Primitive JSON Parser: Extracts numeric values for specific keys.
     * Note: In production environments, using a library like Jackson or Gson is recommended.
     */
    private static Double extractNumber(String json, String key) {
        String needle = "\"" + key + "\":";
        int idx = json.indexOf(needle);
        if (idx == -1) return null;
        int start = idx + needle.length();
        while (start < json.length() && (json.charAt(start) == ' ' || json.charAt(start) == ':')) start++;
        int end = start;
        while (end < json.length() && (Character.isDigit(json.charAt(end)) || json.charAt(end) == '.' || json.charAt(end) == '-')) end++;
        try {
            return Double.parseDouble(json.substring(start, end));
        } catch (Exception e) {
            return null;
        }
    }
}