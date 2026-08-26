package com.finora.ai;

import java.util.Locale;

public final class IntentDetector {
    public FinancialIntent detect(String question) {
        String q = question == null ? "" : question.toLowerCase(Locale.ROOT);
        if (q.startsWith("remember ") || q.startsWith("forget ") || q.contains("what do you remember") || q.contains("clear my") && q.contains("memory")) return FinancialIntent.MEMORY_COMMAND;
        if (has(q,"net worth","worth")) return FinancialIntent.NET_WORTH_QUERY;
        if (has(q,"afford","can i buy","can i spend","purchase")) return FinancialIntent.AFFORDABILITY_QUERY;
        if (has(q,"debt","owe","pay first","debt-free","debt free")) return FinancialIntent.DEBT_QUERY;
        if (has(q,"emi","loan payment","amortization","prepay")) return FinancialIntent.EMI_QUERY;
        if (has(q,"income","earn","salary","paid this month")) return FinancialIntent.INCOME_QUERY;
        if (has(q,"expense","spent","spending","burned","wasting","where is my money")) return FinancialIntent.EXPENSE_QUERY;
        if (has(q,"budget","category limit")) return FinancialIntent.BUDGET_QUERY;
        if (has(q,"goal","laptop","save for")) return FinancialIntent.GOAL_QUERY;
        if (has(q,"invest","mutual fund","index fund","bond","compound")) return FinancialIntent.INVESTMENT_QUERY;
        if (has(q,"save","savings","emergency fund")) return FinancialIntent.SAVINGS_QUERY;
        if (has(q,"subscription","renewal")) return FinancialIntent.SUBSCRIPTION_QUERY;
        if (has(q,"bill","due","coming this week")) return FinancialIntent.BILL_QUERY;
        if (has(q,"forecast","six months","next month","future balance")) return FinancialIntent.FORECAST_QUERY;
        if (has(q,"what if","scenario","income drops","income decreases")) return FinancialIntent.SCENARIO_QUERY;
        if (has(q,"health score","financial health","score low","daily briefing","morning briefing","monthly review","review my month")) return FinancialIntent.FINANCIAL_HEALTH_QUERY;
        if (has(q,"monthly plan","plan my","allocate")) return FinancialIntent.MONTHLY_PLAN_QUERY;
        if (has(q,"balance","how much money","cash")) return FinancialIntent.BALANCE_QUERY;
        if (has(q,"transaction","recent activity")) return FinancialIntent.TRANSACTION_QUERY;
        return FinancialIntent.GENERAL_FINANCE_QUERY;
    }
    private static boolean has(String value,String...terms){for(String term:terms)if(value.contains(term))return true;return false;}
}
