package com.finora.service;

import com.finora.database.ConnectionProvider;
import com.finora.model.UserProfile;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.sql.*;
import java.time.Duration;
import java.time.Instant;
import java.util.Arrays;
import java.util.Base64;
import java.util.Locale;
import java.util.Objects;
import java.util.Optional;
import java.util.regex.Pattern;

public final class AuthService {
    private static final int ITERATIONS = 210_000;
    private static final int KEY_BITS = 256;
    private static final int MAX_FAILURES = 5;
    private static final Duration LOCK_DURATION = Duration.ofMinutes(2);
    private static final Duration REMEMBER_DURATION = Duration.ofDays(30);
    private static final Pattern USERNAME = Pattern.compile("[a-z0-9._-]{3,40}");
    private final ConnectionProvider provider;
    private final RememberTokenStore tokenStore;
    private final SecureRandom random = new SecureRandom();

    public AuthService(ConnectionProvider provider) {
        this(provider, new PreferencesTokenStore());
    }

    public AuthService(ConnectionProvider provider, RememberTokenStore tokenStore) {
        this.provider = Objects.requireNonNull(provider);
        this.tokenStore = Objects.requireNonNull(tokenStore);
    }

    public boolean hasUsers() throws SQLException {
        try (Connection connection = provider.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                     "SELECT COUNT(*) FROM users WHERE active=TRUE");
             ResultSet result = statement.executeQuery()) {
            result.next();
            return result.getLong(1) > 0;
        }
    }

    public UserProfile register(String displayName, String username, char[] password) throws Exception {
        String cleanName;
        String cleanUsername;
        try {
            cleanName = validateDisplayName(displayName);
            cleanUsername = normalizeUsername(username);
            validatePassword(password);
        } catch (RuntimeException exception) {
            if (password != null) Arrays.fill(password, '\0');
            throw exception;
        }
        byte[] salt = new byte[16];
        random.nextBytes(salt);
        byte[] hash = derive(password, salt);
        Arrays.fill(password, '\0');
        Instant now = Instant.now();
        String sql = "INSERT INTO users(display_name,username,password_hash,password_salt,failed_attempts,active,created_at,updated_at,last_login_at) VALUES(?,?,?,?,0,TRUE,?,?,?)";
        try (Connection connection = provider.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
            statement.setString(1, cleanName);
            statement.setString(2, cleanUsername);
            statement.setString(3, Base64.getEncoder().encodeToString(hash));
            statement.setString(4, Base64.getEncoder().encodeToString(salt));
            statement.setTimestamp(5, Timestamp.from(now));
            statement.setTimestamp(6, Timestamp.from(now));
            statement.setTimestamp(7, Timestamp.from(now));
            statement.executeUpdate();
            try (ResultSet keys = statement.getGeneratedKeys()) {
                if (!keys.next()) throw new SQLException("The local database did not return a user ID.");
                return new UserProfile(keys.getLong(1), cleanName, cleanUsername, now, now);
            }
        } catch (SQLIntegrityConstraintViolationException duplicate) {
            throw new IllegalArgumentException("That username is already in use on this device.");
        } finally {
            Arrays.fill(hash, (byte) 0);
            Arrays.fill(salt, (byte) 0);
        }
    }

    public UserProfile authenticate(String username, char[] password) throws Exception {
        if (password == null) throw new AuthenticationException("Username or password is incorrect.");
        String cleanUsername;
        try {
            cleanUsername = normalizeUsername(username);
        } catch (RuntimeException exception) {
            if (password != null) Arrays.fill(password, '\0');
            throw exception;
        }
        String sql = "SELECT id,display_name,username,password_hash,password_salt,failed_attempts,locked_until,created_at,last_login_at FROM users WHERE username=? AND active=TRUE";
        try (Connection connection = provider.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setString(1, cleanUsername);
            try (ResultSet result = statement.executeQuery()) {
                if (!result.next()) {
                    consumePasswordWork(password);
                    throw new AuthenticationException("Username or password is incorrect.");
                }
                long id = result.getLong("id");
                Timestamp lockedTimestamp = result.getTimestamp("locked_until");
                Instant lockedUntil = lockedTimestamp == null ? null : lockedTimestamp.toInstant();
                if (lockedUntil != null && lockedUntil.isAfter(Instant.now())) {
                    Arrays.fill(password, '\0');
                    long seconds = Math.max(1, Duration.between(Instant.now(), lockedUntil).toSeconds());
                    throw new AuthenticationException("Sign in is temporarily locked. Try again in " + seconds + " seconds.");
                }
                byte[] expected = Base64.getDecoder().decode(result.getString("password_hash"));
                byte[] salt = Base64.getDecoder().decode(result.getString("password_salt"));
                byte[] actual = derive(password, salt);
                Arrays.fill(password, '\0');
                boolean valid = MessageDigest.isEqual(expected, actual);
                Arrays.fill(expected, (byte) 0);
                Arrays.fill(actual, (byte) 0);
                Arrays.fill(salt, (byte) 0);
                if (!valid) {
                    recordFailure(connection, id, result.getInt("failed_attempts") + 1);
                    throw new AuthenticationException("Username or password is incorrect.");
                }
                Instant now = Instant.now();
                try (PreparedStatement update = connection.prepareStatement(
                        "UPDATE users SET failed_attempts=0,locked_until=NULL,last_login_at=?,updated_at=? WHERE id=?")) {
                    update.setTimestamp(1, Timestamp.from(now));
                    update.setTimestamp(2, Timestamp.from(now));
                    update.setLong(3, id);
                    update.executeUpdate();
                }
                Timestamp created = result.getTimestamp("created_at");
                return new UserProfile(id, result.getString("display_name"), result.getString("username"),
                        created.toInstant(), now);
            }
        }
    }

    public void configureRememberedSession(UserProfile profile, boolean remember) throws Exception {
        clearRememberedSession();
        if (!remember) return;
        byte[] secretBytes = new byte[32];
        random.nextBytes(secretBytes);
        String secret = Base64.getUrlEncoder().withoutPadding().encodeToString(secretBytes);
        Arrays.fill(secretBytes, (byte) 0);
        String hash = tokenHash(secret);
        Instant now = Instant.now();
        try (Connection connection = provider.getConnection();
             PreparedStatement statement = connection.prepareStatement(
                     "INSERT INTO auth_sessions(user_id,token_hash,expires_at,last_used_at,revoked,created_at) VALUES(?,?,?,?,FALSE,?)",
                     Statement.RETURN_GENERATED_KEYS)) {
            statement.setLong(1, profile.id());
            statement.setString(2, hash);
            statement.setTimestamp(3, Timestamp.from(now.plus(REMEMBER_DURATION)));
            statement.setTimestamp(4, Timestamp.from(now));
            statement.setTimestamp(5, Timestamp.from(now));
            statement.executeUpdate();
            try (ResultSet keys = statement.getGeneratedKeys()) {
                if (!keys.next()) throw new SQLException("The local database did not return a session ID.");
                tokenStore.save(keys.getLong(1) + "." + secret);
            }
        }
    }

    public Optional<UserProfile> tryRememberedSignIn() throws Exception {
        Optional<String> stored = tokenStore.load();
        if (stored.isEmpty()) return Optional.empty();
        String[] parts = stored.get().split("\\.", 2);
        if (parts.length != 2) {
            tokenStore.clear();
            return Optional.empty();
        }
        long sessionId;
        try {
            sessionId = Long.parseLong(parts[0]);
        } catch (NumberFormatException invalid) {
            tokenStore.clear();
            return Optional.empty();
        }
        String sql = "SELECT s.token_hash,s.expires_at,u.id,u.display_name,u.username,u.created_at " +
                "FROM auth_sessions s JOIN users u ON u.id=s.user_id " +
                "WHERE s.id=? AND s.revoked=FALSE AND u.active=TRUE";
        try (Connection connection = provider.getConnection();
             PreparedStatement statement = connection.prepareStatement(sql)) {
            statement.setLong(1, sessionId);
            try (ResultSet result = statement.executeQuery()) {
                if (!result.next() || result.getTimestamp("expires_at").toInstant().isBefore(Instant.now())) {
                    tokenStore.clear();
                    revokeSession(connection, sessionId);
                    return Optional.empty();
                }
                byte[] expected = Base64.getDecoder().decode(result.getString("token_hash"));
                byte[] actual = Base64.getDecoder().decode(tokenHash(parts[1]));
                boolean valid = MessageDigest.isEqual(expected, actual);
                Arrays.fill(expected, (byte) 0);
                Arrays.fill(actual, (byte) 0);
                if (!valid) {
                    tokenStore.clear();
                    revokeSession(connection, sessionId);
                    return Optional.empty();
                }
                Instant now = Instant.now();
                try (PreparedStatement update = connection.prepareStatement(
                        "UPDATE auth_sessions SET last_used_at=?,expires_at=? WHERE id=?")) {
                    update.setTimestamp(1, Timestamp.from(now));
                    update.setTimestamp(2, Timestamp.from(now.plus(REMEMBER_DURATION)));
                    update.setLong(3, sessionId);
                    update.executeUpdate();
                }
                return Optional.of(new UserProfile(result.getLong("id"), result.getString("display_name"),
                        result.getString("username"), result.getTimestamp("created_at").toInstant(), now));
            }
        }
    }

    public void clearRememberedSession() throws SQLException {
        Optional<String> stored = tokenStore.load();
        tokenStore.clear();
        if (stored.isEmpty()) return;
        String[] parts = stored.get().split("\\.", 2);
        if (parts.length == 0) return;
        try {
            long id = Long.parseLong(parts[0]);
            try (Connection connection = provider.getConnection()) {
                revokeSession(connection, id);
            }
        } catch (NumberFormatException ignored) {
            // A malformed local preference has already been removed.
        }
    }

    private static void revokeSession(Connection connection, long sessionId) throws SQLException {
        try (PreparedStatement update = connection.prepareStatement(
                "UPDATE auth_sessions SET revoked=TRUE WHERE id=?")) {
            update.setLong(1, sessionId);
            update.executeUpdate();
        }
    }

    private static String tokenHash(String secret) throws Exception {
        byte[] digest = MessageDigest.getInstance("SHA-256").digest(secret.getBytes(StandardCharsets.UTF_8));
        try {
            return Base64.getEncoder().encodeToString(digest);
        } finally {
            Arrays.fill(digest, (byte) 0);
        }
    }

    private void recordFailure(Connection connection, long id, int failures) throws SQLException {
        Instant lockedUntil = failures >= MAX_FAILURES ? Instant.now().plus(LOCK_DURATION) : null;
        int storedFailures = failures >= MAX_FAILURES ? 0 : failures;
        try (PreparedStatement update = connection.prepareStatement(
                "UPDATE users SET failed_attempts=?,locked_until=?,updated_at=? WHERE id=?")) {
            update.setInt(1, storedFailures);
            if (lockedUntil == null) update.setNull(2, Types.TIMESTAMP);
            else update.setTimestamp(2, Timestamp.from(lockedUntil));
            update.setTimestamp(3, Timestamp.from(Instant.now()));
            update.setLong(4, id);
            update.executeUpdate();
        }
    }

    private static String validateDisplayName(String value) {
        String clean = value == null ? "" : value.trim().replaceAll("\\s+", " ");
        if (clean.length() < 2 || clean.length() > 60)
            throw new IllegalArgumentException("Display name must contain 2–60 characters.");
        return clean;
    }

    private static String normalizeUsername(String value) {
        String clean = value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
        if (!USERNAME.matcher(clean).matches())
            throw new IllegalArgumentException("Username must be 3–40 characters using letters, numbers, dot, dash or underscore.");
        return clean;
    }

    private static void validatePassword(char[] password) {
        if (password == null || password.length < 8 || password.length > 128)
            throw new IllegalArgumentException("Password must contain 8–128 characters.");
        boolean letter = false, number = false;
        for (char value : password) {
            letter |= Character.isLetter(value);
            number |= Character.isDigit(value);
        }
        if (!letter || !number)
            throw new IllegalArgumentException("Password must include at least one letter and one number.");
    }

    private static byte[] derive(char[] password, byte[] salt) throws Exception {
        PBEKeySpec spec = new PBEKeySpec(password, salt, ITERATIONS, KEY_BITS);
        try {
            return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded();
        } finally {
            spec.clearPassword();
        }
    }

    private static void consumePasswordWork(char[] password) throws Exception {
        byte[] salt = "finora-local-auth".getBytes(StandardCharsets.UTF_8);
        byte[] ignored = derive(password, salt);
        Arrays.fill(password, '\0');
        Arrays.fill(ignored, (byte) 0);
    }

    public static final class AuthenticationException extends Exception {
        public AuthenticationException(String message) {
            super(message);
        }
    }
}
