package com.finora.brain;

import com.finora.model.Debt;
import java.math.*;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.util.*;

public final class DebtEngine {
    public enum Strategy { AVALANCHE, SNOWBALL, URGENCY, HYBRID, PERSONAL_PRIORITY }
    public record PrioritizedDebt(Debt debt,int score,String reason){}
    public record DebtForecast(int months,YearMonth debtFreeMonth,BigDecimal estimatedInterest,BigDecimal totalPaid,List<BigDecimal> balances){}
    public record StrategyAdvice(Strategy strategy,String explanation){}

    public List<PrioritizedDebt> prioritize(List<Debt> debts,Strategy strategy,LocalDate today){
        Comparator<Debt> comparator=switch(strategy){
            case AVALANCHE->Comparator.comparing(Debt::interestRate).reversed().thenComparing(Debt::dueDate,Comparator.nullsLast(Comparator.naturalOrder()));
            case SNOWBALL->Comparator.comparing(Debt::remainingAmount);
            case URGENCY->Comparator.comparing(Debt::dueDate,Comparator.nullsLast(Comparator.naturalOrder()));
            case PERSONAL_PRIORITY->Comparator.comparingInt(Debt::userPriority).thenComparing(Debt::dueDate,Comparator.nullsLast(Comparator.naturalOrder()));
            case HYBRID->Comparator.comparingInt((Debt d)->hybridScore(d,today)).reversed();
        };
        return debts.stream().sorted(comparator).map(d->new PrioritizedDebt(d,hybridScore(d,today),reason(d,today,strategy))).toList();
    }
    public StrategyAdvice recommendStrategy(List<Debt> debts,LocalDate today){
        long urgent=debts.stream().filter(d->d.dueDate()!=null&&!d.dueDate().isAfter(today.plusDays(7))).count();
        boolean costly=debts.stream().anyMatch(d->d.interestRate().compareTo(new BigDecimal("15"))>=0);
        if(urgent>=2)return new StrategyAdvice(Strategy.URGENCY,"Two or more obligations are due within seven days, so preventing missed commitments comes first.");
        if(costly)return new StrategyAdvice(Strategy.AVALANCHE,"At least one balance carries a high rate; avalanche is estimated to reduce interest cost.");
        return new StrategyAdvice(Strategy.HYBRID,"A hybrid order balances due dates, cost, penalties, relationship importance and your own ranking.");
    }
    public DebtForecast forecast(List<Debt> debts,BigDecimal monthlyPayment){
        BigDecimal balance=debts.stream().map(Debt::remainingAmount).reduce(BigDecimal.ZERO,BigDecimal::add);
        if(balance.signum()==0)return new DebtForecast(0,YearMonth.now(),BigDecimal.ZERO,BigDecimal.ZERO,List.of(BigDecimal.ZERO));
        if(monthlyPayment==null||monthlyPayment.signum()<=0)return new DebtForecast(-1,null,BigDecimal.ZERO,BigDecimal.ZERO,List.of(balance));
        BigDecimal weightedRate=BigDecimal.ZERO;
        for(Debt d:debts)weightedRate=weightedRate.add(d.remainingAmount().multiply(d.interestRate()));
        weightedRate=weightedRate.divide(balance,MathContext.DECIMAL128).divide(new BigDecimal("1200"),MathContext.DECIMAL128);
        BigDecimal interest=BigDecimal.ZERO,total=BigDecimal.ZERO;List<BigDecimal> points=new ArrayList<>();points.add(balance);
        int months=0;
        while(balance.signum()>0&&months<600){
            BigDecimal monthInterest=balance.multiply(weightedRate,MathContext.DECIMAL128);interest=interest.add(monthInterest);balance=balance.add(monthInterest);
            BigDecimal paid=monthlyPayment.min(balance);balance=balance.subtract(paid);total=total.add(paid);months++;points.add(balance.max(BigDecimal.ZERO).setScale(2,RoundingMode.HALF_UP));
        }
        return new DebtForecast(months,months>=600?null:YearMonth.now().plusMonths(months),interest.setScale(2,RoundingMode.HALF_UP),total.setScale(2,RoundingMode.HALF_UP),List.copyOf(points));
    }
    private static int hybridScore(Debt d,LocalDate today){
        long days=d.dueDate()==null?120:ChronoUnit.DAYS.between(today,d.dueDate());
        int due=days<=0?45:days<=7?40:days<=14?32:days<=30?20:8;
        int rate=Math.min(25,d.interestRate().multiply(new BigDecimal("1.2")).intValue());
        int relationship=d.relationshipImportance()*3;int personal=(6-Math.max(1,Math.min(5,d.userPriority())))*3;int penalty=d.penaltyRisk()?12:0;
        return due+rate+relationship+personal+penalty;
    }
    private static String reason(Debt d,LocalDate today,Strategy strategy){
        if(strategy==Strategy.AVALANCHE)return "Prioritized by interest cost ("+d.interestRate().stripTrailingZeros().toPlainString()+"%).";
        if(strategy==Strategy.SNOWBALL)return "Prioritized by remaining balance.";
        if(strategy==Strategy.PERSONAL_PRIORITY)return "Uses your manual priority ranking.";
        if(d.dueDate()!=null){long days=ChronoUnit.DAYS.between(today,d.dueDate());if(days<=7)return days<0?"Overdue — immediate attention needed.":"Due within seven days.";}
        return d.penaltyRisk()?"Payment delay may have a financial consequence.":"Balanced priority based on urgency, cost and importance.";
    }
}
