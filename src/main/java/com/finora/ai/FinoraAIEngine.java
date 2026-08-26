package com.finora.ai;

import java.util.*;
import java.util.function.Consumer;

/**
 * FINORA BRAIN orchestration: Understand → Retrieve → Calculate → Reason → Explain → Remember.
 * The provider never receives database access and cannot modify financial records.
 */
public final class FinoraAIEngine {
    public enum Stage { UNDERSTANDING, RETRIEVING, CALCULATING, REASONING, EXPLAINING, REMEMBERING, COMPLETE }
    public record Answer(long conversationId,String text,FinancialIntent intent,List<String> tools,
                         int memoriesUsed,boolean verified,ModelInfo modelInfo){}
    private final IntentDetector intents=new IntentDetector();
    private final FinancialToolService tools;
    private final AIMemoryService memory;
    private final ConversationService conversations;
    private final AISettingsService settings;
    private final LocalKnowledgeBase knowledge=new LocalKnowledgeBase();
    private final AIResponseValidator validator=new AIResponseValidator();

    public FinoraAIEngine(FinancialToolService tools,AIMemoryService memory,ConversationService conversations,AISettingsService settings){this.tools=tools;this.memory=memory;this.conversations=conversations;this.settings=settings;}

    public Answer ask(long userId,Long conversationId,String question,Consumer<Stage> status)throws Exception{
        if(question==null||question.isBlank())throw new IllegalArgumentException("Ask FINORA BRAIN a financial question.");
        Consumer<Stage> progress=status==null?ignored->{}:status;
        long cid=conversationId==null?conversations.create(userId,question).id():conversationId;
        progress.accept(Stage.UNDERSTANDING);FinancialIntent intent=intents.detect(question);
        conversations.addMessage(userId,cid,"USER",question,intent.name(),null,true);
        progress.accept(Stage.RETRIEVING);List<AIMemoryService.Memory> memories=memory.relevant(userId,question,5);List<LocalKnowledgeBase.Passage> passages=knowledge.retrieve(question,3);
        if(intent==FinancialIntent.MEMORY_COMMAND){progress.accept(Stage.REMEMBERING);String response=handleMemory(userId,question);conversations.addMessage(userId,cid,"ASSISTANT",response,intent.name(),"memory control",true);progress.accept(Stage.COMPLETE);return new Answer(cid,response,intent,List.of("AI memory controls"),memories.size(),true,ModelInfo.deterministic());}
        progress.accept(Stage.CALCULATING);FinancialToolService.ToolResult result=tools.execute(userId,intent,question);
        progress.accept(Stage.REASONING);String answer=result.answer();AISettingsService.Settings config=settings.get(userId);AIProvider provider=settings.providerFor(config);ModelInfo model=provider.getModelInfo();
        // User-specific numerical output remains the exact verified tool answer. A configured local model is
        // used only for general education, with retrieved local passages and strict number validation.
        if(intent==FinancialIntent.GENERAL_FINANCE_QUERY&&!(provider instanceof DeterministicFallbackProvider)&&provider.isAvailable()){
            progress.accept(Stage.EXPLAINING);String verifiedContext=answer+"\n"+passages.stream().map(LocalKnowledgeBase.Passage::text).reduce("",(a,b)->a+"\n"+b);List<AIRequest.Message> context=new ArrayList<>();
            conversations.messages(userId,cid).stream().skip(Math.max(0,conversations.messages(userId,cid).size()-8)).forEach(m->context.add(new AIRequest.Message(m.role().toLowerCase(),m.content())));
            context.add(new AIRequest.Message("tool",verifiedContext));
            String generated=provider.generate(new AIRequest(systemPrompt(config.responseStyle(),memories),context,.15,500));AIResponseValidator.Validation check=validator.validateModelExplanation(generated,verifiedContext);if(check.safe())answer=generated;else{answer=result.answer()+"\n\n_Local model output was withheld because it introduced unverified content._";model=ModelInfo.deterministic();}
        }else progress.accept(Stage.EXPLAINING);
        progress.accept(Stage.REMEMBERING);String trace=truncate(result.toolTrace(),3900);conversations.addMessage(userId,cid,"ASSISTANT",answer,intent.name(),trace,result.verified());
        progress.accept(Stage.COMPLETE);return new Answer(cid,answer,intent,List.of(readableTool(result.toolTrace())),memories.size(),result.verified(),model);
    }

    public Answer dailyBriefing(long userId,Long conversationId,Consumer<Stage> status)throws Exception{return ask(userId,conversationId,"Give me a financial health check and the most important next action from my current records.",status);}
    private String handleMemory(long userId,String question)throws Exception{
        String q=question.trim(),lower=q.toLowerCase(Locale.ROOT);
        if(lower.contains("disable memory")){memory.setEnabled(userId,false);return "AI memory is now **disabled**. Current database records will still be used for financial calculations.";}
        if(lower.contains("enable memory")){memory.setEnabled(userId,true);return "AI memory is now **enabled**. I will still remember only explicit user-stated preferences or facts, never inferred balances.";}
        if(lower.contains("clear")&&lower.contains("memory")){memory.clear(userId);return "Your AI memory has been cleared immediately. Financial records were not changed.";}
        if(lower.contains("what do you remember")||lower.equals("memory")){List<AIMemoryService.Memory> all=memory.list(userId);if(all.isEmpty())return "I do not have any saved AI memories for you.";StringBuilder b=new StringBuilder("## Saved AI memory\n");all.forEach(m->b.append("- **").append(m.key()).append(":** ").append(m.value()).append('\n'));b.append("\nYou can say “forget …”, disable memory, or manage each item in Memory controls.");return b.toString();}
        if(lower.startsWith("forget ")){String needle=lower.substring(7).trim();List<AIMemoryService.Memory> matches=memory.list(userId).stream().filter(m->(m.key()+" "+m.value()).toLowerCase().contains(needle)).toList();for(var item:matches)memory.delete(userId,item.id());return matches.isEmpty()?"I found no saved memory matching **"+needle+"**.":"Forgot "+matches.size()+" matching AI memor"+(matches.size()==1?"y":"ies")+". Financial records were not changed.";}
        if(lower.startsWith("remember ")){if(!memory.isEnabled(userId))return "AI memory is disabled. Enable it before saving a preference.";String value=q.substring(9).trim();if(value.isBlank())return "Tell me exactly what you want remembered.";String key=value.replaceFirst("(?i)^(that|my|i)\\s+","").replaceAll("[^A-Za-z0-9 ]"," ").replaceAll("\\s+"," ").trim();if(key.length()>48)key=key.substring(0,48).trim();memory.remember(userId,"USER_STATED",key,value,.8,1.0);return "Remembered: **"+value+"**\n\nYou can edit or delete this immediately from Memory controls.";}
        return "Use an explicit memory command: **remember …**, **forget …**, **what do you remember?**, **clear memory**, or **disable memory**.";
    }
    private static String systemPrompt(String style,List<AIMemoryService.Memory> memories){return "You are the private FINORA financial explanation layer. Database/tool context is authoritative. Never invent amounts, dates, balances, rates, transactions, history, market prices or memories. If context is insufficient, state what is missing. Do not expose chain-of-thought; give a concise conclusion, calculation summary, assumptions and next action. Never promise investment returns. Response style: "+style+". User-stated preferences only: "+memories.stream().map(m->m.key()+"="+m.value()).toList();}
    private static String readableTool(String trace){if(trace==null||trace.isBlank())return "No database tool";return trace.startsWith("missing:")?"Missing-data check":trace;}
    private static String truncate(String value,int max){if(value==null)return null;return value.length()>max?value.substring(0,max):value;}
}
