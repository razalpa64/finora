package com.finora.ai;

import java.util.*;
import java.util.regex.*;

public final class AIResponseValidator {
    private static final Pattern NUMBER=Pattern.compile("(?<![A-Za-z])(?:₹|\\$)?[0-9][0-9,]*(?:\\.[0-9]+)?%?");
    public record Validation(boolean safe,List<String> issues){}
    public Validation validateModelExplanation(String generated,String verifiedContext){
        List<String> issues=new ArrayList<>();String lower=generated==null?"":generated.toLowerCase(Locale.ROOT);
        if(lower.contains("guaranteed return")||lower.contains("risk-free return")||lower.contains("definitely will"))issues.add("Unsupported certainty");
        Set<String> allowed=numbers(verifiedContext);for(String value:numbers(generated))if(!allowed.contains(value))issues.add("Unverified number: "+value);
        if(generated==null||generated.isBlank())issues.add("Empty response");
        return new Validation(issues.isEmpty(),List.copyOf(issues));
    }
    private static Set<String> numbers(String value){Set<String> out=new HashSet<>();if(value==null)return out;Matcher m=NUMBER.matcher(value);while(m.find())out.add(m.group().replace(",",""));return out;}
}
