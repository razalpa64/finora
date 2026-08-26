package com.finora.model;

import java.math.BigDecimal;
import java.time.Instant;

public record Investment(long id, String name, String category, BigDecimal currentValue,
                         BigDecimal monthlyContribution, String notes, Instant createdAt, Instant updatedAt) { }
