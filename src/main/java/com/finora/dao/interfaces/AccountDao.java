package com.finora.dao.interfaces;
import com.finora.model.Account;
import java.math.BigDecimal;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.List;
public interface AccountDao {
    List<Account> findAll() throws SQLException;
    Account findById(long id) throws SQLException;
    long insert(Account account, Connection connection) throws SQLException;
    void adjustBalance(long id, BigDecimal delta, Connection connection) throws SQLException;
}
