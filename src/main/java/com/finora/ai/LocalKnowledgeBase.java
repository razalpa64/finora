package com.finora.ai;

import java.util.*;

/** Small embedded educational corpus. It contains no live market data or user facts. */
public final class LocalKnowledgeBase {
    public record Passage(String topic,String text){}
    private static final List<Passage> PASSAGES=List.of(
            new Passage("emergency fund","An emergency fund is liquid money reserved for unplanned essential costs. A suitable target depends on income stability, dependants, insurance, and essential monthly costs."),
            new Passage("debt avalanche","The debt avalanche method pays minimums on all debts and directs extra money to the highest annual interest rate. It normally minimizes interest when rates and payments stay constant."),
            new Passage("debt snowball","The debt snowball method targets the smallest balance first. It may cost more interest than avalanche but can provide faster visible progress."),
            new Passage("budget","A budget is a plan, while transactions are actual activity. Useful reviews compare category limits with posted expenses and revise unrealistic limits."),
            new Passage("net worth","Net worth equals assets minus liabilities. Moving money between owned accounts or earmarking it for a goal does not by itself change net worth."),
            new Passage("emi","An EMI calculation needs principal, periodic interest rate, and number of payments. Fees, insurance, floating-rate changes, and penalties require separate inputs."),
            new Passage("affordability","Affordability should consider cash after near-term obligations, a protected emergency buffer, ongoing monthly margin, financing costs, and irregular expenses."),
            new Passage("investment","Investment returns are uncertain. Decisions should consider time horizon, risk capacity, diversification, fees, taxes, and emergency liquidity. Historical returns are not guarantees."),
            new Passage("forecast","A financial forecast is a scenario based on stated assumptions, not a prediction. Results should change when income, expenses, dates, or rates change."),
            new Passage("privacy","Local processing keeps financial context on the device. Cloud processing should remain disabled unless the user knowingly enables a provider and understands what data will be sent.")
    );
    public List<Passage> retrieve(String query,int limit){String[] words=(query==null?"":query.toLowerCase()).split("[^a-z0-9]+");return PASSAGES.stream().map(p->new Scored(p,score(p,words))).filter(x->x.score>0).sorted(Comparator.comparingInt(Scored::score).reversed()).limit(limit).map(Scored::passage).toList();}
    private static int score(Passage p,String[] words){String h=(p.topic()+" "+p.text()).toLowerCase();int score=0;for(String w:words)if(w.length()>2&&h.contains(w))score++;return score;}
    private record Scored(Passage passage,int score){}
}
