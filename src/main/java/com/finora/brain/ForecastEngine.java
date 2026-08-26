package com.finora.brain;

import com.finora.model.Bill;
import com.finora.model.Debt;
import com.finora.model.IncomeSource;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

public final class ForecastEngine {
    public record ForecastPoint(LocalDate date,BigDecimal income,BigDecimal outflow,BigDecimal endingBalance,boolean belowReserve){}
    public record Forecast(List<ForecastPoint> points,LocalDate firstPressureDate,BigDecimal projectedEndingBalance,String assumption){}

    public Forecast daily(FinancialSnapshot s,int days){
        BigDecimal balance=s.cash();BigDecimal reserve=s.essentialExpenses();List<ForecastPoint> points=new ArrayList<>();LocalDate pressure=null;
        for(int i=0;i<=days;i++){
            LocalDate date=s.asOf().plusDays(i);BigDecimal income=BigDecimal.ZERO,out=BigDecimal.ZERO;
            for(IncomeSource source:s.incomeSources())if(occursOn(source,date))income=income.add(source.amount());
            for(Bill bill:s.bills())if(!bill.paid()&&bill.dueDate().equals(date))out=out.add(bill.amount());
            for(Debt debt:s.debts())if(debt.dueDate()!=null&&debt.dueDate().equals(date))out=out.add(debt.minimumPayment().min(debt.remainingAmount()));
            if(i>0&&date.getDayOfMonth()==1)out=out.add(s.plannedGoalContributions());
            balance=balance.add(income).subtract(out);boolean below=balance.compareTo(reserve)<0;if(below&&pressure==null)pressure=date;
            points.add(new ForecastPoint(date,income,out,balance.setScale(2,RoundingMode.HALF_UP),below));
        }
        return new Forecast(List.copyOf(points),pressure,balance.setScale(2,RoundingMode.HALF_UP),"Only configured recurring income schedules are forecast; unrecorded income and variable spending are excluded.");
    }
    private static boolean occursOn(IncomeSource source,LocalDate date){
        LocalDate occurrence=source.nextIncomeDate();if(date.isBefore(occurrence))return false;
        while(occurrence.isBefore(date))occurrence=source.dateAfter(occurrence);
        return occurrence.equals(date);
    }
    public List<BigDecimal> sixMonthBalances(FinancialSnapshot s){
        BigDecimal balance=s.cash();BigDecimal monthlyNet=s.expectedRecurringIncome().subtract(s.monthlyOutflow()).subtract(s.plannedGoalContributions());List<BigDecimal> values=new ArrayList<>();values.add(balance);
        for(int i=0;i<6;i++){BigDecimal bills=s.bills().stream().filter(Bill::recurring).map(Bill::amount).reduce(BigDecimal.ZERO,BigDecimal::add);balance=balance.add(monthlyNet).subtract(bills);values.add(balance.max(BigDecimal.ZERO).setScale(2,RoundingMode.HALF_UP));}return List.copyOf(values);
    }
}
