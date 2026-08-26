package com.finora.model;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;

public record IncomeSource(long id, String name, BigDecimal amount, Frequency frequency,
                           LocalDate nextIncomeDate, long accountId, boolean active, String notes,
                           Instant createdAt, Instant updatedAt) {
    public enum Frequency {
        WEEKLY("Weekly"),
        BIWEEKLY("Every two weeks"),
        MONTHLY("Monthly"),
        QUARTERLY("Quarterly"),
        ANNUAL("Annual");

        private final String label;
        Frequency(String label) { this.label = label; }
        public String label() { return label; }
    }

    public BigDecimal monthlyEquivalent() {
        BigDecimal multiplier = switch (frequency) {
            case WEEKLY -> new BigDecimal("52").divide(new BigDecimal("12"), MathContext.DECIMAL128);
            case BIWEEKLY -> new BigDecimal("26").divide(new BigDecimal("12"), MathContext.DECIMAL128);
            case MONTHLY -> BigDecimal.ONE;
            case QUARTERLY -> BigDecimal.ONE.divide(new BigDecimal("3"), MathContext.DECIMAL128);
            case ANNUAL -> BigDecimal.ONE.divide(new BigDecimal("12"), MathContext.DECIMAL128);
        };
        return amount.multiply(multiplier, MathContext.DECIMAL128).setScale(2, RoundingMode.HALF_UP);
    }

    public LocalDate dateAfter(LocalDate date) {
        return switch (frequency) {
            case WEEKLY -> date.plusWeeks(1);
            case BIWEEKLY -> date.plusWeeks(2);
            case MONTHLY -> date.plusMonths(1);
            case QUARTERLY -> date.plusMonths(3);
            case ANNUAL -> date.plusYears(1);
        };
    }
}
