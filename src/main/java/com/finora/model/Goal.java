package com.finora.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record Goal(long id, String name, BigDecimal targetAmount, BigDecimal currentAmount, BigDecimal monthlyContribution,
                   LocalDate deadline, Priority priority, String notes, Instant createdAt, Instant updatedAt) {
    public enum Priority { CRITICAL, HIGH, MEDIUM, LOW }
    public BigDecimal remaining() { return targetAmount.subtract(currentAmount).max(BigDecimal.ZERO); }
}
