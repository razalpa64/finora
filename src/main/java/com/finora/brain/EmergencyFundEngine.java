package com.finora.brain;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class EmergencyFundEngine {
    public enum IncomeStability { STABLE, VARIABLE, IRREGULAR }
    public record EmergencyPlan(BigDecimal essentialMonthly,BigDecimal current,BigDecimal threeMonthTarget,
                                BigDecimal recommendedTarget,double progress,double monthsCovered,String rationale){}
    public EmergencyPlan calculate(BigDecimal essentialMonthly,BigDecimal current,IncomeStability stability){
        if(essentialMonthly==null||essentialMonthly.signum()<0||current==null||current.signum()<0)throw new IllegalArgumentException("Emergency-fund inputs cannot be negative.");
        int months=switch(stability){case STABLE->3;case VARIABLE->6;case IRREGULAR->9;};BigDecimal three=essentialMonthly.multiply(new BigDecimal("3"));BigDecimal target=essentialMonthly.multiply(BigDecimal.valueOf(months));double progress=target.signum()==0?0:current.divide(target,6,RoundingMode.HALF_UP).min(BigDecimal.ONE).doubleValue();double covered=essentialMonthly.signum()==0?0:current.divide(essentialMonthly,2,RoundingMode.HALF_UP).doubleValue();return new EmergencyPlan(essentialMonthly,current,three,target,progress,covered,"The target uses "+months+" months because income stability is configured as "+stability.name().toLowerCase()+".");
    }
}
