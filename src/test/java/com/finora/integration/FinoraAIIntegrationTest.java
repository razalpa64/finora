package com.finora.integration;

import com.finora.ai.*;
import com.finora.database.*;
import com.finora.model.Account;
import com.finora.service.*;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.io.TempDir;

import java.math.BigDecimal;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.*;

class FinoraAIIntegrationTest {
    @TempDir Path directory;
    private H2ConnectionProvider provider;
    private long userId;
    private AIMemoryService memory;
    private ConversationService conversations;
    private FinoraAIEngine engine;

    @BeforeEach void setUp() throws Exception {
        provider=new H2ConnectionProvider(directory.resolve("ai-data"));
        DatabaseInitializer.initialize(provider);
        userId=new AuthService(provider).register("AI Owner","ai-owner", "a-strong-password1".toCharArray()).id();
        FinanceService finance=new FinanceService(provider,userId);
        memory=new AIMemoryService(provider);conversations=new ConversationService(provider);
        engine=new FinoraAIEngine(new FinancialToolService(finance),memory,conversations,new AISettingsService(provider));
    }

    @Test void intentRoutingRecognizesCoreFinancialQuestions(){
        IntentDetector detector=new IntentDetector();
        assertEquals(FinancialIntent.NET_WORTH_QUERY,detector.detect("What is my net worth?"));
        assertEquals(FinancialIntent.AFFORDABILITY_QUERY,detector.detect("Can I afford ₹30,000?"));
        assertEquals(FinancialIntent.DEBT_QUERY,detector.detect("Which debt should I pay first?"));
        assertEquals(FinancialIntent.MEMORY_COMMAND,detector.detect("What do you remember about me?"));
    }

    @Test void databaseBackedBalanceAnswerUsesExactRecordedValue() throws Exception {
        FinanceService finance=new FinanceService(provider,userId);
        finance.addAccount("Private account", Account.AccountType.CHECKING,new BigDecimal("12345.67"),false);
        FinoraAIEngine.Answer answer=engine.ask(userId,null,"What is my balance?",null);
        assertTrue(answer.verified());
        assertTrue(answer.text().contains("₹12,345.67"));
        assertEquals(FinancialIntent.BALANCE_QUERY,answer.intent());
    }

    @Test void emptyRecordsProduceExplicitMissingDataInsteadOfInventedFigures() throws Exception {
        FinoraAIEngine.Answer answer=engine.ask(userId,null,"What is my net worth?",null);
        assertTrue(answer.verified());
        assertTrue(answer.text().toLowerCase().contains("need at least one"));
        assertFalse(answer.text().contains("₹1,00,000"));
    }

    @Test void emiIsCalculatedDeterministicallyFromExplicitInputs() throws Exception {
        FinoraAIEngine.Answer answer=engine.ask(userId,null,"EMI for ₹10,000 at 12% for 12 months",null);
        assertEquals(FinancialIntent.EMI_QUERY,answer.intent());
        assertTrue(answer.text().contains("₹888.49"));
        assertTrue(answer.text().contains("BigDecimal")||answer.tools().getFirst().contains("BigDecimal"));
    }

    @Test void memoryCanBeDisabledEditedAndDeletedImmediately() throws Exception {
        memory.remember(userId,"USER_STATED","answer style","Prefer concise answers",.8,1);
        var item=memory.list(userId).getFirst();
        memory.update(userId,item.id(),"Prefer detailed answers");
        assertEquals("Prefer detailed answers",memory.list(userId).getFirst().value());
        memory.setEnabled(userId,false);
        memory.remember(userId,"USER_STATED","new fact","must not persist",.8,1);
        assertEquals(1,memory.list(userId).size());
        memory.delete(userId,item.id());
        assertTrue(memory.list(userId).isEmpty());
    }

    @Test void financialRecordsAndMutationsAreIsolatedByProfile() throws Exception {
        long other=new AuthService(provider).register("Second Finance Owner","finance.two","Secure456".toCharArray()).id();
        FinanceService firstFinance=new FinanceService(provider,userId);
        FinanceService secondFinance=new FinanceService(provider,other);
        long firstAccount=firstFinance.addAccount("First private account",Account.AccountType.CHECKING,new BigDecimal("100.00"),false);
        secondFinance.addAccount("Second private account",Account.AccountType.SAVINGS,new BigDecimal("200.00"),false);
        assertEquals("First private account",firstFinance.accounts().getFirst().name());
        assertEquals("Second private account",secondFinance.accounts().getFirst().name());
        assertEquals(1,firstFinance.accounts().size());
        assertEquals(1,secondFinance.accounts().size());
        var now=java.time.Instant.now();
        firstFinance.addDebt(new com.finora.model.Debt(0,"First debt",com.finora.model.Debt.DebtType.PERSONAL,
                new BigDecimal("50.00"),new BigDecimal("50.00"),BigDecimal.ZERO,new BigDecimal("5.00"),
                java.time.LocalDate.now().plusDays(5),3,3,false,"",now,now));
        secondFinance.addDebt(new com.finora.model.Debt(0,"Second debt",com.finora.model.Debt.DebtType.BANK_LOAN,
                new BigDecimal("75.00"),new BigDecimal("75.00"),BigDecimal.ZERO,new BigDecimal("5.00"),
                java.time.LocalDate.now().plusDays(5),3,3,false,"",now,now));
        firstFinance.addGoal(new com.finora.model.Goal(0,"First goal",new BigDecimal("500.00"),BigDecimal.ZERO,
                new BigDecimal("25.00"),java.time.LocalDate.now().plusMonths(6),com.finora.model.Goal.Priority.MEDIUM,"",now,now));
        secondFinance.addGoal(new com.finora.model.Goal(0,"Second goal",new BigDecimal("700.00"),BigDecimal.ZERO,
                new BigDecimal("30.00"),java.time.LocalDate.now().plusMonths(6),com.finora.model.Goal.Priority.MEDIUM,"",now,now));
        firstFinance.addBill(new com.finora.model.Bill(0,"First bill","Home",new BigDecimal("10.00"),
                java.time.LocalDate.now().plusDays(3),false,null,false,false,null,now,now));
        secondFinance.addBill(new com.finora.model.Bill(0,"Second bill","Home",new BigDecimal("20.00"),
                java.time.LocalDate.now().plusDays(3),false,null,false,false,null,now,now));
        assertEquals("First debt",firstFinance.debts().getFirst().name());
        assertEquals("Second debt",secondFinance.debts().getFirst().name());
        assertEquals("First goal",firstFinance.goals().getFirst().name());
        assertEquals("Second goal",secondFinance.goals().getFirst().name());
        assertEquals("First bill",firstFinance.bills(java.time.LocalDate.now(),java.time.LocalDate.now().plusMonths(1)).getFirst().name());
        assertEquals("Second bill",secondFinance.bills(java.time.LocalDate.now(),java.time.LocalDate.now().plusMonths(1)).getFirst().name());
        assertThrows(java.sql.SQLException.class,()->secondFinance.addTransaction(new BigDecimal("5.00"),
                com.finora.model.TransactionRecord.TransactionType.EXPENSE,"Other",firstAccount,null,
                java.time.LocalDate.now(),"Cross-profile attempt",""));
        assertEquals(new BigDecimal("100.00"),firstFinance.accounts().getFirst().balance());
    }

    @Test void aiMemoryIsIsolatedByAuthenticatedUser() throws Exception {
        long other=new AuthService(provider).register("Other Memory Owner","memory.two","Secure456".toCharArray()).id();
        memory.remember(userId,"USER_STATED","style","concise",.8,1);
        memory.remember(other,"USER_STATED","style","detailed",.8,1);
        assertEquals("concise",memory.list(userId).getFirst().value());
        assertEquals("detailed",memory.list(other).getFirst().value());
        memory.clear(other);
        assertEquals(1,memory.list(userId).size());
        assertTrue(memory.list(other).isEmpty());
    }

    @Test void conversationsAreIsolatedByAuthenticatedUser() throws Exception {
        long other=new AuthService(provider).register("Other Owner","other.owner","Secure456".toCharArray()).id();
        var conversation=conversations.create(userId,"Owner-only conversation");
        conversations.addMessage(userId,conversation.id(),"USER","private question",null,null,true);
        assertEquals(1,conversations.list(userId,"").size());
        assertTrue(conversations.list(other,"").isEmpty());
        assertTrue(conversations.messages(other,conversation.id()).isEmpty());
        assertThrows(java.sql.SQLException.class,()->conversations.addMessage(other,conversation.id(),"USER","intrusion",null,null,true));
    }

    @Test void responseValidatorRejectsUnverifiedNumbersAndGuaranteedReturns(){
        AIResponseValidator validator=new AIResponseValidator();
        assertTrue(validator.validateModelExplanation("Your recorded total is ₹100.","Verified total ₹100").safe());
        assertFalse(validator.validateModelExplanation("Your total is ₹999.","Verified total ₹100").safe());
        assertFalse(validator.validateModelExplanation("This gives a guaranteed return.","No market data").safe());
    }

    @Test void remoteEndpointCannotMasqueradeAsPrivateLocalModel() throws Exception {
        AISettingsService service=new AISettingsService(provider);
        var unsafe=new AISettingsService.Settings(true,true,"OLLAMA","https://remote.example","model","BALANCED",true);
        assertThrows(IllegalArgumentException.class,()->service.update(userId,unsafe));
    }

    @Test void deterministicProviderIsAlwaysAvailableAndStreamsSameVerifiedContext() throws Exception {
        DeterministicFallbackProvider fallback=new DeterministicFallbackProvider();
        AIRequest request=new AIRequest("",java.util.List.of(new AIRequest.Message("tool","verified answer")),0,100);
        assertTrue(fallback.isAvailable());
        assertEquals("verified answer",fallback.generate(request));
        StringBuilder streamed=new StringBuilder();fallback.stream(request,streamed::append,()->{});
        assertEquals("verified answer",streamed.toString());
    }
}
