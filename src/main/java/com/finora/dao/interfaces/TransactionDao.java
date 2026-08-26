package com.finora.dao.interfaces;
import com.finora.model.TransactionRecord;
import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;
public interface TransactionDao {
    List<TransactionRecord> findTransactionsBetween(LocalDate start, LocalDate end) throws SQLException;
    List<TransactionRecord> search(String query, LocalDate start, LocalDate end) throws SQLException;
    long insert(TransactionRecord transaction, Connection connection) throws SQLException;
    void softDelete(long id, Connection connection) throws SQLException;
}
