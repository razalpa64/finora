package com.finora.brain;
import java.math.BigDecimal;
import java.util.List;
public record MonthlyPlan(BigDecimal income,BigDecimal essentials,BigDecimal debtAndEmi,BigDecimal emergencySavings,
                          BigDecimal goals,BigDecimal investments,BigDecimal flexible,BigDecimal reserve,
                          int score,List<String> explanations){}
