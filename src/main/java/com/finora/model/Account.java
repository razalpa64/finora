package com.finora.model;

import java.math.BigDecimal;
import java.time.Instant;

public record Account(long id, String name, AccountType type, BigDecimal balance, String currency,
                      boolean emergencyFund, Instant createdAt, Instant updatedAt) {
    public enum AccountType { CASH, CHECKING, SAVINGS, INVESTMENT, OTHER }
}
