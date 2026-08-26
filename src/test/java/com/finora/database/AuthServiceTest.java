package com.finora.database;

import com.finora.service.AuthService;
import com.finora.service.RememberTokenStore;

import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class AuthServiceTest {
    @TempDir Path directory;

    @Test void registersAndAuthenticatesAHashedLocalProfile() throws Exception {
        H2ConnectionProvider provider = new H2ConnectionProvider(directory);
        DatabaseInitializer.initialize(provider);
        AuthService auth = new AuthService(provider);
        assertFalse(auth.hasUsers());
        var created = auth.register("Local User", "local.user", "Secure123".toCharArray());
        assertTrue(auth.hasUsers());
        var signedIn = auth.authenticate("LOCAL.USER", "Secure123".toCharArray());
        assertEquals(created.id(), signedIn.id());
        assertEquals("Local User", signedIn.displayName());
        assertThrows(AuthService.AuthenticationException.class,
                () -> auth.authenticate("local.user", "Wrong123".toCharArray()));
    }

    @Test void permitsMultipleProfilesWithUniqueUsernames() throws Exception {
        H2ConnectionProvider provider = new H2ConnectionProvider(directory);
        DatabaseInitializer.initialize(provider);
        AuthService auth = new AuthService(provider);
        var first = auth.register("First Owner", "first.owner", "Secure123".toCharArray());
        var second = auth.register("Second Owner", "second.owner", "Secure456".toCharArray());
        assertNotEquals(first.id(), second.id());
        assertEquals(second.id(), auth.authenticate("second.owner", "Secure456".toCharArray()).id());
        assertThrows(IllegalArgumentException.class,
                () -> auth.register("Duplicate", "first.owner", "Secure789".toCharArray()));
    }

    @Test void rejectsWeakPasswordsAndInvalidUsernames() throws Exception {
        H2ConnectionProvider provider = new H2ConnectionProvider(directory);
        DatabaseInitializer.initialize(provider);
        AuthService auth = new AuthService(provider);
        assertThrows(IllegalArgumentException.class,
                () -> auth.register("Local User", "x", "weak".toCharArray()));
    }

    @Test void rememberedSessionUsesARevocableTokenInsteadOfThePassword() throws Exception {
        H2ConnectionProvider provider = new H2ConnectionProvider(directory);
        DatabaseInitializer.initialize(provider);
        MemoryTokenStore tokens = new MemoryTokenStore();
        AuthService auth = new AuthService(provider, tokens);
        var profile = auth.register("Local User", "local.user", "Secure123".toCharArray());
        auth.configureRememberedSession(profile, true);
        assertTrue(tokens.load().isPresent());
        assertFalse(tokens.load().orElseThrow().contains("Secure123"));
        assertEquals(profile.id(), new AuthService(provider, tokens).tryRememberedSignIn().orElseThrow().id());
        auth.clearRememberedSession();
        assertTrue(tokens.load().isEmpty());
        assertTrue(auth.tryRememberedSignIn().isEmpty());
    }

    private static final class MemoryTokenStore implements RememberTokenStore {
        private String token;
        @Override public Optional<String> load() { return Optional.ofNullable(token); }
        @Override public void save(String token) { this.token = token; }
        @Override public void clear() { token = null; }
    }
}
