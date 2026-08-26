package com.finora.brain;

import com.finora.model.Bill;
import com.finora.model.Debt;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public final class RecommendationEngine {
    public List<Recommendation> generate(FinancialSnapshot s,SafeToSpendResult safe,HealthScore health){
        List<Recommendation> out=new ArrayList<>();LocalDate today=s.asOf();
        s.debts().stream().filter(d->d.dueDate()!=null&&!d.dueDate().isAfter(today.plusDays(7))).sorted(Comparator.comparing(Debt::dueDate)).findFirst().ifPresent(d->{long days=ChronoUnit.DAYS.between(today,d.dueDate());out.add(new Recommendation(days<0?Recommendation.Severity.CRITICAL:Recommendation.Severity.WARNING,d.name()+" payment "+(days<0?"is overdue":"due in "+days+" days"),"Protect ₹"+d.minimumPayment().setScale(0)+" for this obligation before flexible spending.","Review debt","Recorded balance: ₹"+d.remainingAmount().setScale(0),"Assumes the recorded due date and minimum payment are current."));});
        BigDecimal target=s.essentialExpenses().multiply(new BigDecimal("3"));
        if(target.signum()>0&&s.emergencyFund().compareTo(target)<0){int percent=s.emergencyFund().multiply(new BigDecimal("100")).divide(target,0,java.math.RoundingMode.DOWN).intValue();out.add(new Recommendation(percent<30?Recommendation.Severity.WARNING:Recommendation.Severity.ATTENTION,"Emergency reserve is "+percent+"% funded","Your reserve is below three months of recorded essential expenses.","Build reserve","Current reserve: ₹"+s.emergencyFund().setScale(0),"Target uses three months of this month's essential spending."));}
        BigDecimal subscriptions=s.bills().stream().filter(Bill::subscription).map(Bill::amount).reduce(BigDecimal.ZERO,BigDecimal::add);
        if(s.monthlyIncome().signum()>0&&subscriptions.compareTo(s.monthlyIncome().multiply(new BigDecimal("0.05")))>0)out.add(new Recommendation(Recommendation.Severity.ATTENTION,"Subscription load is elevated","Recorded subscriptions exceed 5% of monthly income.","Review subscriptions","Monthly subscriptions: ₹"+subscriptions.setScale(0),"All recurring subscriptions are assumed active."));
        if(safe.today().signum()==0)out.add(new Recommendation(Recommendation.Severity.WARNING,"Flexible spending is paused","Recorded obligations and protected allocations use the available operating capacity.","Review this month's plan","Safe-to-spend today: ₹0","Unrecorded income is not included."));
        if(out.isEmpty()||health.overall()>=75)out.add(new Recommendation(Recommendation.Severity.HEALTHY,"Monthly plan is on track","Your recorded cash flow can protect current priorities and a safety buffer.","Keep plan","Health score: "+health.overall()+"/100","Assumes recorded income and due dates remain stable."));
        return List.copyOf(out);
    }
}
