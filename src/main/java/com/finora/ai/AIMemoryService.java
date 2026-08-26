package com.finora.ai;

import com.finora.database.ConnectionProvider;

import java.sql.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public final class AIMemoryService {
    public record Memory(long id,long userId,String type,String key,String value,double importance,double confidence,
                         Instant createdAt,Instant updatedAt,Instant lastUsedAt){}
    private final ConnectionProvider provider;
    public AIMemoryService(ConnectionProvider provider){this.provider=provider;}

    public boolean isEnabled(long userId)throws SQLException{
        ensureSettings(userId);try(Connection c=provider.getConnection();PreparedStatement p=c.prepareStatement("SELECT memory_enabled FROM ai_settings WHERE user_id=?")){p.setLong(1,userId);try(ResultSet r=p.executeQuery()){return r.next()&&r.getBoolean(1);}}
    }
    public void setEnabled(long userId,boolean enabled)throws SQLException{
        ensureSettings(userId);try(Connection c=provider.getConnection();PreparedStatement p=c.prepareStatement("UPDATE ai_settings SET memory_enabled=?,updated_at=? WHERE user_id=?")){p.setBoolean(1,enabled);p.setTimestamp(2,Timestamp.from(Instant.now()));p.setLong(3,userId);p.executeUpdate();}
    }
    public List<Memory> list(long userId)throws SQLException{
        String sql="SELECT * FROM ai_memory WHERE user_id=? AND deleted=FALSE ORDER BY importance DESC,last_used_at DESC";try(Connection c=provider.getConnection();PreparedStatement p=c.prepareStatement(sql)){p.setLong(1,userId);try(ResultSet r=p.executeQuery()){List<Memory> out=new ArrayList<>();while(r.next())out.add(map(r));return out;}}
    }
    public List<Memory> relevant(long userId,String query,int limit)throws SQLException{
        if(!isEnabled(userId))return List.of();String[] words=query.toLowerCase().split("[^a-z0-9]+");return list(userId).stream().map(memory->new Scored(memory,score(memory,words))).filter(value->value.score>0).sorted(java.util.Comparator.comparingDouble(Scored::score).reversed()).limit(limit).map(Scored::memory).peek(memory->touch(memory.id())).toList();
    }
    public void remember(long userId,String type,String key,String value,double importance,double confidence)throws SQLException{
        if(!isEnabled(userId))return;Memory existing=list(userId).stream().filter(m->m.type().equalsIgnoreCase(type)&&m.key().equalsIgnoreCase(key)).findFirst().orElse(null);Instant now=Instant.now();
        if(existing==null){try(Connection c=provider.getConnection();PreparedStatement p=c.prepareStatement("INSERT INTO ai_memory(user_id,memory_type,memory_key,memory_value,importance,confidence,last_used_at,created_at,updated_at) VALUES(?,?,?,?,?,?,?,?,?)")){p.setLong(1,userId);p.setString(2,type);p.setString(3,key);p.setString(4,value);p.setBigDecimal(5,java.math.BigDecimal.valueOf(importance));p.setBigDecimal(6,java.math.BigDecimal.valueOf(confidence));p.setTimestamp(7,Timestamp.from(now));p.setTimestamp(8,Timestamp.from(now));p.setTimestamp(9,Timestamp.from(now));p.executeUpdate();}}
        else{try(Connection c=provider.getConnection();PreparedStatement p=c.prepareStatement("UPDATE ai_memory SET memory_value=?,importance=?,confidence=?,last_used_at=?,updated_at=?,deleted=FALSE WHERE id=?")){p.setString(1,value);p.setBigDecimal(2,java.math.BigDecimal.valueOf(importance));p.setBigDecimal(3,java.math.BigDecimal.valueOf(confidence));p.setTimestamp(4,Timestamp.from(now));p.setTimestamp(5,Timestamp.from(now));p.setLong(6,existing.id());p.executeUpdate();}}
        prune(userId,200);
    }
    public void update(long userId,long id,String value)throws SQLException{if(value==null||value.isBlank())throw new IllegalArgumentException("Memory value cannot be empty.");try(Connection c=provider.getConnection();PreparedStatement p=c.prepareStatement("UPDATE ai_memory SET memory_value=?,updated_at=?,last_used_at=? WHERE id=? AND user_id=? AND deleted=FALSE")){p.setString(1,value.trim());p.setTimestamp(2,Timestamp.from(Instant.now()));p.setTimestamp(3,Timestamp.from(Instant.now()));p.setLong(4,id);p.setLong(5,userId);p.executeUpdate();}}
    public void delete(long userId,long id)throws SQLException{try(Connection c=provider.getConnection();PreparedStatement p=c.prepareStatement("UPDATE ai_memory SET deleted=TRUE,updated_at=? WHERE id=? AND user_id=?")){p.setTimestamp(1,Timestamp.from(Instant.now()));p.setLong(2,id);p.setLong(3,userId);p.executeUpdate();}}
    public void clear(long userId)throws SQLException{try(Connection c=provider.getConnection();PreparedStatement p=c.prepareStatement("UPDATE ai_memory SET deleted=TRUE,updated_at=? WHERE user_id=?")){p.setTimestamp(1,Timestamp.from(Instant.now()));p.setLong(2,userId);p.executeUpdate();}}
    private void ensureSettings(long userId)throws SQLException{try(Connection c=provider.getConnection();PreparedStatement q=c.prepareStatement("SELECT user_id FROM ai_settings WHERE user_id=?")){q.setLong(1,userId);try(ResultSet r=q.executeQuery()){if(r.next())return;}}try(Connection c=provider.getConnection();PreparedStatement p=c.prepareStatement("INSERT INTO ai_settings(user_id,memory_enabled,daily_briefing,provider_type,updated_at) VALUES(?,TRUE,TRUE,'DETERMINISTIC',?)")){p.setLong(1,userId);p.setTimestamp(2,Timestamp.from(Instant.now()));p.executeUpdate();}catch(SQLIntegrityConstraintViolationException ignored){}}
    private void touch(long id){try(Connection c=provider.getConnection();PreparedStatement p=c.prepareStatement("UPDATE ai_memory SET last_used_at=? WHERE id=?")){p.setTimestamp(1,Timestamp.from(Instant.now()));p.setLong(2,id);p.executeUpdate();}catch(SQLException ignored){}}
    private void prune(long userId,int max)throws SQLException{List<Memory> all=list(userId);for(int i=max;i<all.size();i++)delete(userId,all.get(i).id());}
    private static double score(Memory memory,String[] words){String hay=(memory.type()+" "+memory.key()+" "+memory.value()).toLowerCase();double score=memory.importance();for(String word:words)if(word.length()>2&&hay.contains(word))score+=1;long age=java.time.Duration.between(memory.lastUsedAt(),Instant.now()).toDays();return score*Math.max(.2,1-age/365d);}
    private static Memory map(ResultSet r)throws SQLException{return new Memory(r.getLong("id"),r.getLong("user_id"),r.getString("memory_type"),r.getString("memory_key"),r.getString("memory_value"),r.getBigDecimal("importance").doubleValue(),r.getBigDecimal("confidence").doubleValue(),r.getTimestamp("created_at").toInstant(),r.getTimestamp("updated_at").toInstant(),r.getTimestamp("last_used_at").toInstant());}
    private record Scored(Memory memory,double score){}
}
