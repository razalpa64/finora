package com.finora.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record Debt(long id, String name, DebtType type, BigDecimal originalAmount, BigDecimal remainingAmount,
                   BigDecimal interestRate, BigDecimal minimumPayment, LocalDate dueDate, int userPriority,
                   int relationshipImportance, boolean penaltyRisk, String notes, Instant createdAt, Instant updatedAt) {
    public enum DebtType { PERSONAL, FAMILY, FRIEND, BANK_LOAN, CREDIT_CARD, EDUCATION_LOAN, VEHICLE_LOAN, HOME_LOAN, BNPL, OTHER }
}
