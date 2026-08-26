package com.finora.dao.interfaces;
import com.finora.model.Debt;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
public interface DebtDao {
    List<Debt> findActiveDebts() throws SQLException;
    long insert(Debt debt) throws SQLException;
    void reduceBalance(long debtId, BigDecimal amount, Connection connection) throws SQLException;
    void delete(long id) throws SQLException;
}
