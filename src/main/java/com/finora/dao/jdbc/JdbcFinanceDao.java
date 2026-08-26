package com.finora.dao.jdbc;

import com.finora.dao.interfaces.*;
import com.finora.database.ConnectionProvider;
import com.finora.model.*;

import java.math.BigDecimal;
import java.sql.*;
import java.time.*;
import java.util.*;
import java.util.function.LongSupplier;

/** Every read and mutation is constrained by the currently authenticated owner ID. */
public final class JdbcFinanceDao implements AccountDao, TransactionDao, IncomeSourceDao, DebtDao, GoalDao, BillDao, PlanningDao {
    private final ConnectionProvider provider;
    private final LongSupplier owner;

    public JdbcFinanceDao(ConnectionProvider provider, LongSupplier owner) {
        this.provider = Objects.requireNonNull(provider);
        this.owner = Objects.requireNonNull(owner);
    }
    public JdbcFinanceDao(ConnectionProvider provider, long userId) { this(provider, () -> userId); }
    private long uid() {
        long value = owner.getAsLong();
        if (value <= 0) throw new IllegalStateException("Sign in before accessing financial records.");
        return value;
    }

    @Override public List<Account> findAll() throws SQLException {
        try(Connection c=provider.getConnection();PreparedStatement p=c.prepareStatement(
                "SELECT * FROM accounts WHERE user_id=? AND deleted=FALSE ORDER BY id")){
            p.setLong(1,uid());try(ResultSet r=p.executeQuery()){List<Account> out=new ArrayList<>();while(r.next())out.add(account(r));return out;}}
    }
    @Override public Account findById(long id) throws SQLException {
        try(Connection c=provider.getConnection();PreparedStatement p=c.prepareStatement(
                "SELECT * FROM accounts WHERE id=? AND user_id=? AND deleted=FALSE")){
            p.setLong(1,id);p.setLong(2,uid());try(ResultSet r=p.executeQuery()){if(!r.next())throw new SQLException("Account is unavailable for this profile.");return account(r);}}
    }
    @Override public long insert(Account a,Connection c)throws SQLException{
        try(PreparedStatement p=c.prepareStatement(
                "INSERT INTO accounts(user_id,name,account_type,balance,currency,emergency_fund,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?)",Statement.RETURN_GENERATED_KEYS)){
            Instant now=Instant.now();p.setLong(1,uid());p.setString(2,a.name());p.setString(3,a.type().name());p.setBigDecimal(4,a.balance());p.setString(5,a.currency());p.setBoolean(6,a.emergencyFund());p.setTimestamp(7,Timestamp.from(now));p.setTimestamp(8,Timestamp.from(now));return executeAndKey(p);}
    }
    @Override public void adjustBalance(long id,BigDecimal delta,Connection c)throws SQLException{
        try(PreparedStatement p=c.prepareStatement("UPDATE accounts SET balance=balance+?,updated_at=? WHERE id=? AND user_id=? AND deleted=FALSE")){
            p.setBigDecimal(1,delta);p.setTimestamp(2,Timestamp.from(Instant.now()));p.setLong(3,id);p.setLong(4,uid());if(p.executeUpdate()!=1)throw new SQLException("Account balance update failed for this profile.");}
    }
    public void assertAccountOwned(long id,Connection c)throws SQLException{
        try(PreparedStatement p=c.prepareStatement("SELECT 1 FROM accounts WHERE id=? AND user_id=? AND deleted=FALSE")){p.setLong(1,id);p.setLong(2,uid());try(ResultSet r=p.executeQuery()){if(!r.next())throw new SQLException("The selected account does not belong to this profile.");}}
    }

    @Override public List<IncomeSource> findActiveIncomeSources() throws SQLException {
        try(Connection c=provider.getConnection();PreparedStatement p=c.prepareStatement(
                "SELECT * FROM income_sources WHERE user_id=? AND deleted=FALSE AND active=TRUE ORDER BY next_income_date,name")){
            p.setLong(1,uid());try(ResultSet r=p.executeQuery()){List<IncomeSource> out=new ArrayList<>();while(r.next())out.add(incomeSource(r));return out;}}
    }
    @Override public long insertIncomeSource(IncomeSource source,Connection c)throws SQLException{
        assertAccountOwned(source.accountId(),c);
        String sql="INSERT INTO income_sources(user_id,name,amount,frequency,next_income_date,account_id,active,notes,created_at,updated_at) VALUES(?,?,?,?,?,?,TRUE,?,?,?)";
        try(PreparedStatement p=c.prepareStatement(sql,Statement.RETURN_GENERATED_KEYS)){
            Instant now=Instant.now();p.setLong(1,uid());p.setString(2,source.name());p.setBigDecimal(3,source.amount());p.setString(4,source.frequency().name());p.setDate(5,java.sql.Date.valueOf(source.nextIncomeDate()));p.setLong(6,source.accountId());p.setString(7,source.notes());p.setTimestamp(8,Timestamp.from(now));p.setTimestamp(9,Timestamp.from(now));return executeAndKey(p);}
    }
    @Override public void updateNextIncomeDate(long id,LocalDate nextDate,Connection c)throws SQLException{
        try(PreparedStatement p=c.prepareStatement("UPDATE income_sources SET next_income_date=?,updated_at=? WHERE id=? AND user_id=? AND deleted=FALSE")){
            p.setDate(1,java.sql.Date.valueOf(nextDate));p.setTimestamp(2,Timestamp.from(Instant.now()));p.setLong(3,id);p.setLong(4,uid());if(p.executeUpdate()!=1)throw new SQLException("Income schedule could not be updated for this profile.");}
    }
    @Override public void deleteIncomeSource(long id)throws SQLException{
        try(Connection c=provider.getConnection();PreparedStatement p=c.prepareStatement("UPDATE income_sources SET deleted=TRUE,active=FALSE,updated_at=? WHERE id=? AND user_id=?")){
            p.setTimestamp(1,Timestamp.from(Instant.now()));p.setLong(2,id);p.setLong(3,uid());p.executeUpdate();}
    }

    @Override public List<TransactionRecord> findTransactionsBetween(LocalDate start,LocalDate end)throws SQLException{
        return queryTransactions("SELECT * FROM financial_transactions WHERE user_id=? AND deleted=FALSE AND tx_date BETWEEN ? AND ? ORDER BY tx_date DESC,id DESC",null,start,end);
    }
    @Override public List<TransactionRecord> search(String query,LocalDate start,LocalDate end)throws SQLException{
        return queryTransactions("SELECT * FROM financial_transactions WHERE user_id=? AND deleted=FALSE AND tx_date BETWEEN ? AND ? AND (LOWER(description) LIKE ? OR LOWER(category) LIKE ?) ORDER BY tx_date DESC,id DESC",query,start,end);
    }
    private List<TransactionRecord> queryTransactions(String sql,String query,LocalDate start,LocalDate end)throws SQLException{
        try(Connection c=provider.getConnection();PreparedStatement p=c.prepareStatement(sql)){
            p.setLong(1,uid());p.setDate(2,java.sql.Date.valueOf(start));p.setDate(3,java.sql.Date.valueOf(end));if(query!=null){String q="%"+query.toLowerCase(Locale.ROOT)+"%";p.setString(4,q);p.setString(5,q);}try(ResultSet r=p.executeQuery()){
                List<TransactionRecord> out=new ArrayList<>();while(r.next())out.add(transaction(r));return out;}}
    }
    @Override public long insert(TransactionRecord t,Connection c)throws SQLException{
        assertAccountOwned(t.accountId(),c);if(t.relatedAccountId()!=null)assertAccountOwned(t.relatedAccountId(),c);
        String sql="INSERT INTO financial_transactions(user_id,amount,tx_type,category,account_id,related_account_id,tx_date,description,notes,reference_id,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)";
        try(PreparedStatement p=c.prepareStatement(sql,Statement.RETURN_GENERATED_KEYS)){
            Instant now=Instant.now();p.setLong(1,uid());p.setBigDecimal(2,t.amount());p.setString(3,t.type().name());p.setString(4,t.category());p.setLong(5,t.accountId());setNullableLong(p,6,t.relatedAccountId());p.setDate(7,java.sql.Date.valueOf(t.date()));p.setString(8,t.description());p.setString(9,t.notes());setNullableLong(p,10,t.referenceId());p.setTimestamp(11,Timestamp.from(now));p.setTimestamp(12,Timestamp.from(now));return executeAndKey(p);}
    }
    @Override public void softDelete(long id,Connection c)throws SQLException{
        try(PreparedStatement p=c.prepareStatement("UPDATE financial_transactions SET deleted=TRUE,updated_at=? WHERE id=? AND user_id=?")){p.setTimestamp(1,Timestamp.from(Instant.now()));p.setLong(2,id);p.setLong(3,uid());p.executeUpdate();}
    }

    @Override public List<Debt> findActiveDebts()throws SQLException{
        try(Connection c=provider.getConnection();PreparedStatement p=c.prepareStatement("SELECT * FROM debts WHERE user_id=? AND deleted=FALSE AND remaining_amount>0 ORDER BY due_date,id")){
            p.setLong(1,uid());try(ResultSet r=p.executeQuery()){List<Debt> out=new ArrayList<>();while(r.next())out.add(debt(r));return out;}}
    }
    @Override public long insert(Debt d)throws SQLException{
        String sql="INSERT INTO debts(user_id,name,debt_type,original_amount,remaining_amount,interest_rate,minimum_payment,due_date,user_priority,relationship_importance,penalty_risk,notes,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
        try(Connection c=provider.getConnection();PreparedStatement p=c.prepareStatement(sql,Statement.RETURN_GENERATED_KEYS)){
            Instant now=Instant.now();p.setLong(1,uid());p.setString(2,d.name());p.setString(3,d.type().name());p.setBigDecimal(4,d.originalAmount());p.setBigDecimal(5,d.remainingAmount());p.setBigDecimal(6,d.interestRate());p.setBigDecimal(7,d.minimumPayment());setDate(p,8,d.dueDate());p.setInt(9,d.userPriority());p.setInt(10,d.relationshipImportance());p.setBoolean(11,d.penaltyRisk());p.setString(12,d.notes());p.setTimestamp(13,Timestamp.from(now));p.setTimestamp(14,Timestamp.from(now));return executeAndKey(p);}
    }
    @Override public void reduceBalance(long debtId,BigDecimal amount,Connection c)throws SQLException{
        try(PreparedStatement p=c.prepareStatement("UPDATE debts SET remaining_amount=CASE WHEN remaining_amount>? THEN remaining_amount-? ELSE 0 END,updated_at=? WHERE id=? AND user_id=? AND deleted=FALSE")){
            p.setBigDecimal(1,amount);p.setBigDecimal(2,amount);p.setTimestamp(3,Timestamp.from(Instant.now()));p.setLong(4,debtId);p.setLong(5,uid());if(p.executeUpdate()!=1)throw new SQLException("Debt payment could not be applied for this profile.");}
    }
    @Override public void delete(long id)throws SQLException{
        try(Connection c=provider.getConnection();PreparedStatement p=c.prepareStatement("UPDATE debts SET deleted=TRUE,updated_at=? WHERE id=? AND user_id=?")){p.setTimestamp(1,Timestamp.from(Instant.now()));p.setLong(2,id);p.setLong(3,uid());p.executeUpdate();}
    }

    @Override public List<Goal> findActiveGoals()throws SQLException{
        try(Connection c=provider.getConnection();PreparedStatement p=c.prepareStatement("SELECT * FROM goals WHERE user_id=? AND deleted=FALSE AND current_amount<target_amount ORDER BY CASE priority WHEN 'CRITICAL' THEN 1 WHEN 'HIGH' THEN 2 WHEN 'MEDIUM' THEN 3 ELSE 4 END,deadline")){
            p.setLong(1,uid());try(ResultSet r=p.executeQuery()){List<Goal> out=new ArrayList<>();while(r.next())out.add(goal(r));return out;}}
    }
    @Override public long insert(Goal g)throws SQLException{
        String sql="INSERT INTO goals(user_id,name,target_amount,current_amount,monthly_contribution,deadline,priority,notes,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?)";
        try(Connection c=provider.getConnection();PreparedStatement p=c.prepareStatement(sql,Statement.RETURN_GENERATED_KEYS)){
            Instant now=Instant.now();p.setLong(1,uid());p.setString(2,g.name());p.setBigDecimal(3,g.targetAmount());p.setBigDecimal(4,g.currentAmount());p.setBigDecimal(5,g.monthlyContribution());setDate(p,6,g.deadline());p.setString(7,g.priority().name());p.setString(8,g.notes());p.setTimestamp(9,Timestamp.from(now));p.setTimestamp(10,Timestamp.from(now));return executeAndKey(p);}
    }
    @Override public void contribute(long goalId,BigDecimal amount,Connection c)throws SQLException{
        try(PreparedStatement p=c.prepareStatement("UPDATE goals SET current_amount=CASE WHEN current_amount+?>target_amount THEN target_amount ELSE current_amount+? END,updated_at=? WHERE id=? AND user_id=? AND deleted=FALSE")){
            p.setBigDecimal(1,amount);p.setBigDecimal(2,amount);p.setTimestamp(3,Timestamp.from(Instant.now()));p.setLong(4,goalId);p.setLong(5,uid());if(p.executeUpdate()!=1)throw new SQLException("Goal contribution could not be applied for this profile.");}
    }

    @Override public List<Bill> findBillsBetween(LocalDate start,LocalDate end)throws SQLException{
        try(Connection c=provider.getConnection();PreparedStatement p=c.prepareStatement("SELECT * FROM bills WHERE user_id=? AND deleted=FALSE AND due_date BETWEEN ? AND ? ORDER BY due_date,id")){
            p.setLong(1,uid());p.setDate(2,java.sql.Date.valueOf(start));p.setDate(3,java.sql.Date.valueOf(end));try(ResultSet r=p.executeQuery()){List<Bill> out=new ArrayList<>();while(r.next())out.add(bill(r));return out;}}
    }
    @Override public List<Bill> findSubscriptions()throws SQLException{
        try(Connection c=provider.getConnection();PreparedStatement p=c.prepareStatement("SELECT * FROM bills WHERE user_id=? AND deleted=FALSE AND subscription=TRUE ORDER BY due_date")){
            p.setLong(1,uid());try(ResultSet r=p.executeQuery()){List<Bill> out=new ArrayList<>();while(r.next())out.add(bill(r));return out;}}
    }
    @Override public long insert(Bill b)throws SQLException{
        String sql="INSERT INTO bills(user_id,name,category,amount,due_date,recurring,frequency,paid,subscription,last_used_date,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)";
        try(Connection c=provider.getConnection();PreparedStatement p=c.prepareStatement(sql,Statement.RETURN_GENERATED_KEYS)){
            Instant now=Instant.now();p.setLong(1,uid());p.setString(2,b.name());p.setString(3,b.category());p.setBigDecimal(4,b.amount());setDate(p,5,b.dueDate());p.setBoolean(6,b.recurring());p.setString(7,b.frequency());p.setBoolean(8,b.paid());p.setBoolean(9,b.subscription());setDate(p,10,b.lastUsedDate());p.setTimestamp(11,Timestamp.from(now));p.setTimestamp(12,Timestamp.from(now));return executeAndKey(p);}
    }
    @Override public void markPaid(long id,boolean paid)throws SQLException{
        try(Connection c=provider.getConnection();PreparedStatement p=c.prepareStatement("UPDATE bills SET paid=?,updated_at=? WHERE id=? AND user_id=?")){p.setBoolean(1,paid);p.setTimestamp(2,Timestamp.from(Instant.now()));p.setLong(3,id);p.setLong(4,uid());p.executeUpdate();}
    }

    @Override public List<Budget> findBudgets(YearMonth month)throws SQLException{
        try(Connection c=provider.getConnection();PreparedStatement p=c.prepareStatement("SELECT * FROM budgets WHERE user_id=? AND deleted=FALSE AND month_key=? ORDER BY category")){
            p.setLong(1,uid());p.setString(2,month.toString());try(ResultSet r=p.executeQuery()){List<Budget> out=new ArrayList<>();while(r.next())out.add(new Budget(r.getLong("id"),r.getString("category"),r.getBigDecimal("limit_amount"),YearMonth.parse(r.getString("month_key")),instant(r,"created_at"),instant(r,"updated_at")));return out;}}
    }
    @Override public List<Investment> findInvestments()throws SQLException{
        try(Connection c=provider.getConnection();PreparedStatement p=c.prepareStatement("SELECT * FROM investments WHERE user_id=? AND deleted=FALSE ORDER BY current_value DESC")){
            p.setLong(1,uid());try(ResultSet r=p.executeQuery()){List<Investment> out=new ArrayList<>();while(r.next())out.add(new Investment(r.getLong("id"),r.getString("name"),r.getString("category"),r.getBigDecimal("current_value"),r.getBigDecimal("monthly_contribution"),r.getString("notes"),instant(r,"created_at"),instant(r,"updated_at")));return out;}}
    }

    private static Account account(ResultSet r)throws SQLException{return new Account(r.getLong("id"),r.getString("name"),Account.AccountType.valueOf(r.getString("account_type")),r.getBigDecimal("balance"),r.getString("currency"),r.getBoolean("emergency_fund"),instant(r,"created_at"),instant(r,"updated_at"));}
    private static IncomeSource incomeSource(ResultSet r)throws SQLException{return new IncomeSource(r.getLong("id"),r.getString("name"),r.getBigDecimal("amount"),IncomeSource.Frequency.valueOf(r.getString("frequency")),date(r,"next_income_date"),r.getLong("account_id"),r.getBoolean("active"),r.getString("notes"),instant(r,"created_at"),instant(r,"updated_at"));}
    private static TransactionRecord transaction(ResultSet r)throws SQLException{return new TransactionRecord(r.getLong("id"),r.getBigDecimal("amount"),TransactionRecord.TransactionType.valueOf(r.getString("tx_type")),r.getString("category"),r.getLong("account_id"),nullableLong(r,"related_account_id"),r.getDate("tx_date").toLocalDate(),r.getString("description"),r.getString("notes"),nullableLong(r,"reference_id"),instant(r,"created_at"),instant(r,"updated_at"));}
    private static Debt debt(ResultSet r)throws SQLException{return new Debt(r.getLong("id"),r.getString("name"),Debt.DebtType.valueOf(r.getString("debt_type")),r.getBigDecimal("original_amount"),r.getBigDecimal("remaining_amount"),r.getBigDecimal("interest_rate"),r.getBigDecimal("minimum_payment"),date(r,"due_date"),r.getInt("user_priority"),r.getInt("relationship_importance"),r.getBoolean("penalty_risk"),r.getString("notes"),instant(r,"created_at"),instant(r,"updated_at"));}
    private static Goal goal(ResultSet r)throws SQLException{return new Goal(r.getLong("id"),r.getString("name"),r.getBigDecimal("target_amount"),r.getBigDecimal("current_amount"),r.getBigDecimal("monthly_contribution"),date(r,"deadline"),Goal.Priority.valueOf(r.getString("priority")),r.getString("notes"),instant(r,"created_at"),instant(r,"updated_at"));}
    private static Bill bill(ResultSet r)throws SQLException{return new Bill(r.getLong("id"),r.getString("name"),r.getString("category"),r.getBigDecimal("amount"),date(r,"due_date"),r.getBoolean("recurring"),r.getString("frequency"),r.getBoolean("paid"),r.getBoolean("subscription"),date(r,"last_used_date"),instant(r,"created_at"),instant(r,"updated_at"));}
    private static long executeAndKey(PreparedStatement p)throws SQLException{p.executeUpdate();try(ResultSet k=p.getGeneratedKeys()){if(k.next())return k.getLong(1);throw new SQLException("Database did not return a generated ID.");}}
    private static void setNullableLong(PreparedStatement p,int index,Long value)throws SQLException{if(value==null)p.setNull(index,Types.BIGINT);else p.setLong(index,value);}
    private static Long nullableLong(ResultSet r,String column)throws SQLException{long value=r.getLong(column);return r.wasNull()?null:value;}
    private static void setDate(PreparedStatement p,int index,LocalDate date)throws SQLException{if(date==null)p.setNull(index,Types.DATE);else p.setDate(index,java.sql.Date.valueOf(date));}
    private static LocalDate date(ResultSet r,String column)throws SQLException{java.sql.Date d=r.getDate(column);return d==null?null:d.toLocalDate();}
    private static Instant instant(ResultSet r,String column)throws SQLException{Timestamp t=r.getTimestamp(column);return t==null?Instant.EPOCH:t.toInstant();}
}
