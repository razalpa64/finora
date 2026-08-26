package com.finora.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

public record Bill(long id, String name, String category, BigDecimal amount, LocalDate dueDate,
                   boolean recurring, String frequency, boolean paid, boolean subscription,
                   LocalDate lastUsedDate, Instant createdAt, Instant updatedAt) { }
