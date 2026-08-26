package com.finora.dao.interfaces;
import com.finora.model.Bill;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.List;
public interface BillDao {
    List<Bill> findBillsBetween(LocalDate start, LocalDate end) throws SQLException;
    List<Bill> findSubscriptions() throws SQLException;
    long insert(Bill bill) throws SQLException;
    void markPaid(long id, boolean paid) throws SQLException;
}
