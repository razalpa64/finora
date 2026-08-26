package com.finora.dao.interfaces;
import com.finora.model.Goal;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
public interface GoalDao {
    List<Goal> findActiveGoals() throws SQLException;
    long insert(Goal goal) throws SQLException;
    void contribute(long goalId, BigDecimal amount, Connection connection) throws SQLException;
}
