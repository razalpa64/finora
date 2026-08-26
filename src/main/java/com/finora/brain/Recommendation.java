package com.finora.brain;
public record Recommendation(Severity severity,String title,String message,String action,String fact,String assumption){
    public enum Severity{HEALTHY,ATTENTION,WARNING,CRITICAL}
}
