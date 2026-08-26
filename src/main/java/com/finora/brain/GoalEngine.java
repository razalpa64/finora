package com.finora.brain;

import com.finora.model.Goal;
import java.math.*;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;

public final class GoalEngine {
    public record GoalForecast(Goal goal,int months,YearMonth estimatedCompletion,boolean onTrack,BigDecimal requiredMonthly){}
    public List<Goal> prioritize(List<Goal> goals){
        return goals.stream().sorted(Comparator.comparingInt((Goal g)->switch(g.priority()){case CRITICAL->0;case HIGH->1;case MEDIUM->2;case LOW->3;}).thenComparing(Goal::deadline,Comparator.nullsLast(Comparator.naturalOrder()))).toList();
    }
    public GoalForecast forecast(Goal goal,BigDecimal monthlyContribution){
        BigDecimal remaining=goal.remaining();int months=monthlyContribution.signum()<=0?-1:remaining.divide(monthlyContribution,0,RoundingMode.CEILING).intValue();
        YearMonth completion=months<0?null:YearMonth.now().plusMonths(months);
        int monthsToDeadline=goal.deadline()==null?months:Math.max(1,(int)java.time.temporal.ChronoUnit.MONTHS.between(YearMonth.now(),YearMonth.from(goal.deadline())));
        BigDecimal required=remaining.divide(BigDecimal.valueOf(monthsToDeadline),2,RoundingMode.CEILING);
        boolean onTrack=goal.deadline()==null||(completion!=null&&!completion.isAfter(YearMonth.from(goal.deadline())));
        return new GoalForecast(goal,months,completion,onTrack,required);
    }
}
