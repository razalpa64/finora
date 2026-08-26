package com.finora.model;

import java.math.BigDecimal;
import java.time.LocalDate;

public record FinancialEvent(LocalDate date, String title, String type, BigDecimal amount, boolean incoming, String status) { }
