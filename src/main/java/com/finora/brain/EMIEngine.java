package com.finora.brain;

import java.math.*;

public final class EMIEngine {
    public record EMIResult(BigDecimal emi,BigDecimal totalInterest,BigDecimal totalRepayment){}
    public record PrepaymentResult(BigDecimal newEmi,int newTenureMonths,BigDecimal interestSaved,int monthsReduced,String mode){}

    public EMIResult calculate(BigDecimal principal,BigDecimal annualRate,int months){
        if(principal==null||principal.signum()<=0||annualRate==null||annualRate.signum()<0||months<=0)throw new IllegalArgumentException("Principal, rate and tenure must be valid.");
        MathContext mc=MathContext.DECIMAL128;BigDecimal emi;
        if(annualRate.signum()==0)emi=principal.divide(BigDecimal.valueOf(months),mc);
        else{BigDecimal r=annualRate.divide(new BigDecimal("1200"),mc);BigDecimal factor=BigDecimal.ONE.add(r).pow(months,mc);emi=principal.multiply(r,mc).multiply(factor,mc).divide(factor.subtract(BigDecimal.ONE),mc);}
        BigDecimal repayment=emi.multiply(BigDecimal.valueOf(months));return new EMIResult(money(emi),money(repayment.subtract(principal)),money(repayment));
    }
    public PrepaymentResult prepay(BigDecimal principal,BigDecimal annualRate,int remainingMonths,BigDecimal currentEmi,BigDecimal extra,boolean reduceTenure){
        if(extra==null||extra.signum()<=0||extra.compareTo(principal)>=0)throw new IllegalArgumentException("Extra payment must be positive and lower than the remaining principal.");
        BigDecimal reduced=principal.subtract(extra);EMIResult original=calculate(principal,annualRate,remainingMonths);
        if(!reduceTenure){EMIResult next=calculate(reduced,annualRate,remainingMonths);return new PrepaymentResult(next.emi(),remainingMonths,money(original.totalInterest().subtract(next.totalInterest()).max(BigDecimal.ZERO)),0,"REDUCE_EMI");}
        BigDecimal monthlyRate=annualRate.divide(new BigDecimal("1200"),MathContext.DECIMAL128);int months=0;BigDecimal balance=reduced;BigDecimal interest=BigDecimal.ZERO;
        while(balance.signum()>0&&months<remainingMonths){BigDecimal charge=balance.multiply(monthlyRate);interest=interest.add(charge);balance=balance.add(charge).subtract(currentEmi);months++;}
        return new PrepaymentResult(money(currentEmi),months,money(original.totalInterest().subtract(interest).max(BigDecimal.ZERO)),Math.max(0,remainingMonths-months),"REDUCE_TENURE");
    }
    private static BigDecimal money(BigDecimal n){return n.setScale(2,RoundingMode.HALF_UP);}
}
