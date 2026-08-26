package com.finora.brain;
import java.math.BigDecimal;
public record SafeToSpendResult(BigDecimal today,BigDecimal flexibleRemaining,BigDecimal operatingCapacity,
                                BigDecimal protectedReserve,int remainingDays,String explanation){}
