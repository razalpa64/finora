package com.finora.brain;

import com.finora.model.Debt;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class FinancialEngineTest {
    @Test void emiUsesReducingBalanceFormula() {
        EMIEngine.EMIResult result = new EMIEngine().calculate(new BigDecimal("500000"), new BigDecimal("9.5"), 60);
        assertTrue(result.emi().compareTo(new BigDecimal("10500")) > 0);
        assertTrue(result.emi().compareTo(new BigDecimal("10502")) < 0);
        assertEquals(new BigDecimal("500000.00").add(result.totalInterest()), result.totalRepayment());
    }

    @Test void urgencyStrategyRanksNearestDueDateFirst() {
        LocalDate today = LocalDate.now();
        Debt later = debt(1, "Later", "10000", "20", today.plusDays(30));
        Debt urgent = debt(2, "Urgent", "25000", "0", today.plusDays(2));
        var ranked = new DebtEngine().prioritize(List.of(later, urgent), DebtEngine.Strategy.URGENCY, today);
        assertEquals("Urgent", ranked.getFirst().debt().name());
    }

    @Test void prepaymentNeverIncreasesInterest() {
        EMIEngine engine = new EMIEngine();
        EMIEngine.EMIResult base = engine.calculate(new BigDecimal("400000"), new BigDecimal("10"), 48);
        var result = engine.prepay(new BigDecimal("400000"), new BigDecimal("10"), 48, base.emi(), new BigDecimal("50000"), true);
        assertTrue(result.interestSaved().signum() > 0);
        assertTrue(result.monthsReduced() > 0);
    }

    private Debt debt(long id, String name, String amount, String rate, LocalDate due) {
        return new Debt(id, name, Debt.DebtType.PERSONAL, new BigDecimal(amount), new BigDecimal(amount),
                new BigDecimal(rate), new BigDecimal("1000"), due, 3, 3, false, "", Instant.now(), Instant.now());
    }
}
