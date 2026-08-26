package com.finora.brain;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

public final class InvestmentEngine {
    public record Allocation(String category,BigDecimal amount,String rationale){}
    public record InvestmentPlan(BigDecimal capacity,boolean eligible,List<Allocation> allocations,List<String> assumptions){}
    public InvestmentPlan plan(FinancialSnapshot s,BigDecimal capacity){
        boolean highCostDebt=s.debts().stream().anyMatch(d->d.interestRate().compareTo(new BigDecimal("15"))>=0);
        BigDecimal target=s.essentialExpenses().multiply(new BigDecimal("3"));
        if(s.emergencyFund().compareTo(target)<0||highCostDebt)return new InvestmentPlan(capacity,false,List.of(),List.of("Emergency reserves should reach the configured minimum and high-cost debt should be controlled before long-term allocation."));
        BigDecimal longTerm=capacity.multiply(new BigDecimal("0.625"));BigDecimal goals=capacity.multiply(new BigDecimal("0.25"));BigDecimal liquid=capacity.subtract(longTerm).subtract(goals);
        return new InvestmentPlan(capacity,true,List.of(new Allocation("Long-term investments",money(longTerm),"Diversified long-horizon allocation."),new Allocation("Goals",money(goals),"Deadline-based planned needs."),new Allocation("Flexible savings",money(liquid),"Liquidity for changing priorities.")),List.of("Allocation is educational, uses user-entered values and assumes income remains stable.","No return is guaranteed and no live market data is used."));
    }
    private static BigDecimal money(BigDecimal n){return n.setScale(2,RoundingMode.HALF_UP);}
}
