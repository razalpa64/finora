package com.finora.brain;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

public final class BudgetEngine {
    private static final BigDecimal ZERO=BigDecimal.ZERO.setScale(2);

    public SafeToSpendResult safeToSpend(FinancialSnapshot s){
        int days=Math.max(1,YearMonth.from(s.asOf()).lengthOfMonth()-s.asOf().getDayOfMonth()+1);
        BigDecimal incomeCapacity=s.monthlyIncome().subtract(s.monthlyOutflow()).subtract(s.upcomingBills()).subtract(s.upcomingDebtCommitments());
        BigDecimal operating=incomeCapacity.max(BigDecimal.ZERO).min(s.cash().max(BigDecimal.ZERO));
        BigDecimal emergencyTarget=s.essentialExpenses().multiply(new BigDecimal("3"));
        BigDecimal emergencyGap=emergencyTarget.subtract(s.emergencyFund()).max(BigDecimal.ZERO);
        BigDecimal protectedReserve=emergencyGap.min(percent(s.monthlyIncome(),"0.05"));
        BigDecimal goals=s.plannedGoalContributions().min(percent(s.monthlyIncome(),"0.12"));
        BigDecimal beforeBuffer=operating.subtract(protectedReserve).subtract(goals).max(BigDecimal.ZERO);
        BigDecimal safetyBuffer=beforeBuffer.multiply(new BigDecimal("0.30"));
        BigDecimal flexible=beforeBuffer.subtract(safetyBuffer).max(BigDecimal.ZERO);
        BigDecimal today=flexible.divide(BigDecimal.valueOf(days),2,RoundingMode.DOWN);
        String explanation="Operating capacity after recorded outflow and obligations is protected by a 30% cash-flow buffer before it is divided across "+days+" remaining day"+(days==1?"":"s")+".";
        return new SafeToSpendResult(today,flexible.setScale(2,RoundingMode.HALF_UP),operating.setScale(2,RoundingMode.HALF_UP),protectedReserve.add(safetyBuffer).setScale(2,RoundingMode.HALF_UP),days,explanation);
    }

    public MonthlyPlan createPlan(FinancialSnapshot s){
        BigDecimal income=s.monthlyIncome();
        if(income.signum()<=0)return new MonthlyPlan(ZERO,ZERO,ZERO,ZERO,ZERO,ZERO,ZERO,ZERO,0,List.of("Add reliable monthly income to build a plan."));
        BigDecimal essentials=s.essentialExpenses().multiply(new BigDecimal("1.03")).min(percent(income,"0.65"));
        BigDecimal available=income.subtract(essentials).max(BigDecimal.ZERO);
        BigDecimal requestedDebt=s.debts().stream().map(d->d.minimumPayment()).reduce(BigDecimal.ZERO,BigDecimal::add);
        BigDecimal debt=take(available,requestedDebt.min(percent(income,"0.18")));available=available.subtract(debt);
        BigDecimal emergencyGap=s.essentialExpenses().multiply(new BigDecimal("3")).subtract(s.emergencyFund()).max(BigDecimal.ZERO);
        BigDecimal emergency=take(available,emergencyGap.min(percent(income,"0.08")));available=available.subtract(emergency);
        BigDecimal goals=take(available,s.plannedGoalContributions().min(percent(income,"0.08")));available=available.subtract(goals);
        boolean readyToInvest=s.emergencyFund().compareTo(s.essentialExpenses().multiply(new BigDecimal("1.5")))>=0&&s.debts().stream().noneMatch(d->d.interestRate().compareTo(new BigDecimal("15"))>0);
        BigDecimal investments=readyToInvest?take(available,percent(income,"0.05")):ZERO;available=available.subtract(investments);
        BigDecimal reserve=take(available,percent(income,"0.05"));available=available.subtract(reserve);
        BigDecimal flexible=available.max(BigDecimal.ZERO);
        int score=75;
        List<String> notes=new ArrayList<>();
        if(essentials.compareTo(percent(income,"0.55"))<=0){score+=6;notes.add("Essential costs remain within 55% of recorded income.");}else{score-=5;notes.add("Essential costs use more than 55% of income.");}
        if(debt.signum()>0){score+=4;notes.add("The plan protects required debt and EMI payments before discretionary spending.");}
        if(emergency.signum()>0){score+=5;notes.add("Emergency reserves receive funding based on the actual reserve gap.");}
        if(flexible.compareTo(percent(income,"0.20"))>0){score-=4;notes.add("Flexible spending is relatively high; keep the reserve unspent.");}
        if(!readyToInvest)notes.add("Investment allocation is paused because emergency-fund or high-cost-debt conditions come first.");
        else notes.add("A modest investment allocation is included after near-term obligations.");
        return new MonthlyPlan(money(income),money(essentials),money(debt),money(emergency),money(goals),money(investments),money(flexible),money(reserve),Math.max(0,Math.min(100,score)),List.copyOf(notes));
    }
    private static BigDecimal percent(BigDecimal n,String p){return n.multiply(new BigDecimal(p));}
    private static BigDecimal take(BigDecimal available,BigDecimal requested){return available.min(requested).max(BigDecimal.ZERO);}
    private static BigDecimal money(BigDecimal n){return n.setScale(2,RoundingMode.HALF_UP);}
}
