package com.finora.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.YearMonth;

public record Budget(long id, String category, BigDecimal limitAmount, YearMonth month, Instant createdAt, Instant updatedAt) { }
