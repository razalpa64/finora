package com.finora.brain;

import com.finora.model.Budget;
import com.finora.model.Debt;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public final class FinancialHealthEngine {
    public HealthScore calculate(FinancialSnapshot s){
        Map<String,Integer> factors=new LinkedHashMap<>();
        BigDecimal income=s.monthlyIncome();
        int savings=income.signum()==0?0:scoreRatio(income.subtract(s.monthlyOutflow()).max(BigDecimal.ZERO),income,new BigDecimal("0.25"));
        BigDecimal minimums=s.debts().stream().map(Debt::minimumPayment).reduce(BigDecimal.ZERO,BigDecimal::add);
        int debt=income.signum()==0?(s.liabilities().signum()==0?100:20):inverseRatio(minimums,income,new BigDecimal("0.35"));
        BigDecimal emergencyTarget=s.essentialExpenses().multiply(new BigDecimal("6"));
        int emergency=emergencyTarget.signum()==0?60:ratio100(s.emergencyFund(),emergencyTarget);
        int budget=budgetScore(s);
        int goals=s.goals().isEmpty()?70:(int)Math.round(s.goals().stream().mapToDouble(g->g.currentAmount().divide(g.targetAmount(),4,RoundingMode.HALF_UP).min(BigDecimal.ONE).doubleValue()*100).average().orElse(70));
        int cashFlow=income.signum()==0?30:inverseRatio(s.upcomingBills().add(s.upcomingDebtCommitments()),income,new BigDecimal("0.50"));
        factors.put("Savings",savings);factors.put("Debt",debt);factors.put("Emergency",emergency);factors.put("Budget",budget);factors.put("Goals",goals);factors.put("Cash flow",cashFlow);
        int overall=(int)Math.round(savings*.18+debt*.20+emergency*.18+budget*.16+goals*.12+cashFlow*.16);
        String label=overall>=85?"Excellent":overall>=70?"Stable":overall>=55?"Needs attention":"At risk";
        List<String> reasons=List.of("Savings is based on recorded income minus this month's outflow.","Debt and cash-flow scores use minimum commitments relative to recorded income.","Emergency readiness is measured against six months of recorded essential expenses.");
        return new HealthScore(overall,Map.copyOf(factors),reasons,label);
    }
    private static int budgetScore(FinancialSnapshot s){
        if(s.budgets().isEmpty())return 60;double sum=0;for(Budget b:s.budgets()){BigDecimal spent=s.expenseByCategory().getOrDefault(b.category(),BigDecimal.ZERO);double ratio=spent.divide(b.limitAmount(),4,RoundingMode.HALF_UP).doubleValue();sum+=ratio<=.85?95:ratio<=1?82:Math.max(20,82-(ratio-1)*100);}return (int)Math.round(sum/s.budgets().size());
    }
    private static int scoreRatio(BigDecimal value,BigDecimal base,BigDecimal target){BigDecimal ratio=value.divide(base,6,RoundingMode.HALF_UP).divide(target,6,RoundingMode.HALF_UP);return clamp(ratio.multiply(new BigDecimal("100")).intValue());}
    private static int inverseRatio(BigDecimal value,BigDecimal base,BigDecimal critical){BigDecimal ratio=value.divide(base,6,RoundingMode.HALF_UP).divide(critical,6,RoundingMode.HALF_UP);return clamp(BigDecimal.ONE.subtract(ratio.multiply(new BigDecimal("0.75"))).multiply(new BigDecimal("100")).intValue());}
    private static int ratio100(BigDecimal value,BigDecimal target){return clamp(value.divide(target,6,RoundingMode.HALF_UP).multiply(new BigDecimal("100")).intValue());}
    private static int clamp(int value){return Math.max(0,Math.min(100,value));}
}
