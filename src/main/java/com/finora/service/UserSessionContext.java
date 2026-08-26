package com.finora.service;

import java.util.concurrent.atomic.AtomicLong;
import java.util.function.LongSupplier;

/** Process-local authenticated owner scope used by every financial DAO operation. */
public final class UserSessionContext implements LongSupplier {
    private final AtomicLong userId = new AtomicLong();

    public void activate(long id) {
        if (id <= 0) throw new IllegalArgumentException("A valid user ID is required.");
        userId.set(id);
    }

    public void clear() { userId.set(0); }
    public boolean isAuthenticated() { return userId.get() > 0; }

    public long requireUserId() {
        long id = userId.get();
        if (id <= 0) throw new IllegalStateException("Sign in before accessing financial records.");
        return id;
    }

    @Override public long getAsLong() { return requireUserId(); }
}
