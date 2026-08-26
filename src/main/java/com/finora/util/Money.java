package com.finora.util;
import java.math.BigDecimal;
import java.text.NumberFormat;
import java.util.Locale;
public final class Money {
    private static final Locale INDIA=Locale.of("en","IN");
    private Money(){}
    public static String inr(BigDecimal amount){NumberFormat f=NumberFormat.getCurrencyInstance(INDIA);f.setMaximumFractionDigits(amount.stripTrailingZeros().scale()>0?2:0);return f.format(amount);}
    public static String compact(BigDecimal amount){double n=amount.doubleValue();if(Math.abs(n)>=10_000_000)return String.format(INDIA,"₹%.2fCr",n/10_000_000);if(Math.abs(n)>=100_000)return String.format(INDIA,"₹%.2fL",n/100_000);return inr(amount);}
}
