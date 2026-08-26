package com.finora.ai;

import com.finora.database.ConnectionProvider;

import java.sql.*;
import java.time.Instant;
import java.util.*;

public final class ConversationService {
    public record Conversation(long id,long userId,String title,boolean deleted,Instant createdAt,Instant updatedAt){}
    public record ChatMessage(long id,long conversationId,String role,String content,String intent,String toolTrace,
                              boolean verified,Instant createdAt){}
    private final ConnectionProvider provider;
    public ConversationService(ConnectionProvider provider){this.provider=provider;}

    public Conversation create(long userId,String title)throws SQLException{
        Instant now=Instant.now();try(Connection c=provider.getConnection();PreparedStatement p=c.prepareStatement("INSERT INTO ai_conversations(user_id,title,created_at,updated_at) VALUES(?,?,?,?)",Statement.RETURN_GENERATED_KEYS)){p.setLong(1,userId);p.setString(2,cleanTitle(title));p.setTimestamp(3,Timestamp.from(now));p.setTimestamp(4,Timestamp.from(now));p.executeUpdate();try(ResultSet r=p.getGeneratedKeys()){if(r.next()){prune(userId,30);return new Conversation(r.getLong(1),userId,cleanTitle(title),false,now,now);}}}throw new SQLException("Conversation could not be created.");
    }
    public List<Conversation> list(long userId,String search)throws SQLException{
        String text=search==null?"":search.trim().toLowerCase();String sql=text.isBlank()?"SELECT * FROM ai_conversations WHERE user_id=? AND deleted=FALSE ORDER BY updated_at DESC":"SELECT DISTINCT c.* FROM ai_conversations c LEFT JOIN ai_messages m ON m.conversation_id=c.id WHERE c.user_id=? AND c.deleted=FALSE AND (LOWER(c.title) LIKE ? OR LOWER(m.content) LIKE ?) ORDER BY c.updated_at DESC";
        try(Connection c=provider.getConnection();PreparedStatement p=c.prepareStatement(sql)){p.setLong(1,userId);if(!text.isBlank()){p.setString(2,"%"+text+"%");p.setString(3,"%"+text+"%");}try(ResultSet r=p.executeQuery()){List<Conversation> out=new ArrayList<>();while(r.next())out.add(mapConversation(r));return out;}}
    }
    public List<ChatMessage> messages(long userId,long conversationId)throws SQLException{
        String sql="SELECT m.* FROM ai_messages m JOIN ai_conversations c ON c.id=m.conversation_id WHERE c.user_id=? AND c.id=? ORDER BY m.created_at,id";try(Connection c=provider.getConnection();PreparedStatement p=c.prepareStatement(sql)){p.setLong(1,userId);p.setLong(2,conversationId);try(ResultSet r=p.executeQuery()){List<ChatMessage> out=new ArrayList<>();while(r.next())out.add(mapMessage(r));return out;}}
    }
    public ChatMessage addMessage(long userId,long conversationId,String role,String content,String intent,String toolTrace,boolean verified)throws SQLException{
        Instant now=Instant.now();try(Connection c=provider.getConnection()){c.setAutoCommit(false);try(PreparedStatement guard=c.prepareStatement("SELECT id FROM ai_conversations WHERE id=? AND user_id=?");PreparedStatement p=c.prepareStatement("INSERT INTO ai_messages(conversation_id,role,content,intent,tool_trace,verified,created_at) VALUES(?,?,?,?,?,?,?)",Statement.RETURN_GENERATED_KEYS);PreparedStatement u=c.prepareStatement("UPDATE ai_conversations SET updated_at=? WHERE id=?")){guard.setLong(1,conversationId);guard.setLong(2,userId);try(ResultSet r=guard.executeQuery()){if(!r.next())throw new SQLException("Conversation does not belong to this user.");}p.setLong(1,conversationId);p.setString(2,role);p.setString(3,content);p.setString(4,intent);p.setString(5,toolTrace);p.setBoolean(6,verified);p.setTimestamp(7,Timestamp.from(now));p.executeUpdate();u.setTimestamp(1,Timestamp.from(now));u.setLong(2,conversationId);u.executeUpdate();long messageId;try(ResultSet r=p.getGeneratedKeys()){r.next();messageId=r.getLong(1);}pruneMessages(c,conversationId,200);c.commit();return new ChatMessage(messageId,conversationId,role,content,intent,toolTrace,verified,now);}catch(SQLException e){c.rollback();throw e;}}
    }
    public void rename(long userId,long id,String title)throws SQLException{try(Connection c=provider.getConnection();PreparedStatement p=c.prepareStatement("UPDATE ai_conversations SET title=?,updated_at=? WHERE id=? AND user_id=?")){p.setString(1,cleanTitle(title));p.setTimestamp(2,Timestamp.from(Instant.now()));p.setLong(3,id);p.setLong(4,userId);p.executeUpdate();}}
    public void delete(long userId,long id)throws SQLException{try(Connection c=provider.getConnection()){c.setAutoCommit(false);try(PreparedStatement m=c.prepareStatement("DELETE FROM ai_messages WHERE conversation_id=? AND EXISTS(SELECT 1 FROM ai_conversations WHERE id=? AND user_id=?)");PreparedStatement p=c.prepareStatement("DELETE FROM ai_conversations WHERE id=? AND user_id=?")){m.setLong(1,id);m.setLong(2,id);m.setLong(3,userId);m.executeUpdate();p.setLong(1,id);p.setLong(2,userId);p.executeUpdate();c.commit();}catch(SQLException e){c.rollback();throw e;}}}
    private void prune(long userId,int max)throws SQLException{List<Conversation> all=list(userId,"");for(int i=max;i<all.size();i++)delete(userId,all.get(i).id());}
    private static void pruneMessages(Connection connection,long conversationId,int max)throws SQLException{List<Long> ids=new ArrayList<>();try(PreparedStatement p=connection.prepareStatement("SELECT id FROM ai_messages WHERE conversation_id=? ORDER BY created_at DESC,id DESC")){p.setLong(1,conversationId);try(ResultSet r=p.executeQuery()){while(r.next())ids.add(r.getLong(1));}}if(ids.size()<=max)return;try(PreparedStatement p=connection.prepareStatement("DELETE FROM ai_messages WHERE id=? AND conversation_id=?")){for(int i=max;i<ids.size();i++){p.setLong(1,ids.get(i));p.setLong(2,conversationId);p.addBatch();}p.executeBatch();}}
    private static String cleanTitle(String title){String value=title==null||title.isBlank()?"New conversation":title.trim().replaceAll("\\s+"," ");return value.length()>72?value.substring(0,72):value;}
    private static Conversation mapConversation(ResultSet r)throws SQLException{return new Conversation(r.getLong("id"),r.getLong("user_id"),r.getString("title"),r.getBoolean("deleted"),r.getTimestamp("created_at").toInstant(),r.getTimestamp("updated_at").toInstant());}
    private static ChatMessage mapMessage(ResultSet r)throws SQLException{return new ChatMessage(r.getLong("id"),r.getLong("conversation_id"),r.getString("role"),r.getString("content"),r.getString("intent"),r.getString("tool_trace"),r.getBoolean("verified"),r.getTimestamp("created_at").toInstant());}
}
