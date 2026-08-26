package com.finora.dao.interfaces;
import com.finora.model.Budget;
import com.finora.model.Investment;
import java.sql.SQLException;
import java.time.YearMonth;
import java.util.List;
public interface PlanningDao {
    List<Budget> findBudgets(YearMonth month) throws SQLException;
    List<Investment> findInvestments() throws SQLException;
}
