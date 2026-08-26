package com.finora.dao.interfaces;

import com.finora.model.IncomeSource;

import java.sql.Connection;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;

public interface IncomeSourceDao {
    List<IncomeSource> findActiveIncomeSources() throws SQLException;
    long insertIncomeSource(IncomeSource source, Connection connection) throws SQLException;
    void updateNextIncomeDate(long id, LocalDate date, Connection connection) throws SQLException;
    void deleteIncomeSource(long id) throws SQLException;
}
