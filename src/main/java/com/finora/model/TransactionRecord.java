package com.finora.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record TransactionRecord(long id, BigDecimal amount, TransactionType type, String category,
                                long accountId, Long relatedAccountId, LocalDate date, String description,
                                String notes, Long referenceId, Instant createdAt, Instant updatedAt) {
    public enum TransactionType { INCOME, EXPENSE, TRANSFER, DEBT_PAYMENT, EMI_PAYMENT, GOAL_CONTRIBUTION, INVESTMENT_CONTRIBUTION }
}
