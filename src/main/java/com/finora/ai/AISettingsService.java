package com.finora.ai;

import com.finora.database.ConnectionProvider;
import java.net.URI;
import java.sql.*;
import java.time.Instant;

public final class AISettingsService {
    public record Settings(boolean memoryEnabled,boolean dailyBriefing,String providerType,String providerEndpoint,
                           String modelName,String responseStyle,boolean cloudConsent){}
    private final ConnectionProvider provider;
    public AISettingsService(ConnectionProvider provider){this.provider=provider;}
    public Settings get(long userId)throws SQLException{ensure(userId);try(Connection c=provider.getConnection();PreparedStatement p=c.prepareStatement("SELECT * FROM ai_settings WHERE user_id=?")){p.setLong(1,userId);try(ResultSet r=p.executeQuery()){r.next();return new Settings(r.getBoolean("memory_enabled"),r.getBoolean("daily_briefing"),r.getString("provider_type"),r.getString("endpoint"),r.getString("model_name"),r.getString("response_style"),r.getBoolean("cloud_consent"));}}}
    public void update(long userId,Settings value)throws SQLException{ensure(userId);String type=safe(value.providerType(),"DETERMINISTIC").toUpperCase();if(type.contains("CLOUD")&&!value.cloudConsent())throw new IllegalArgumentException("Cloud provider use requires explicit consent.");if((type.equals("OLLAMA")||type.contains("LLAMA"))&&!isLoopback(value.providerEndpoint()))throw new IllegalArgumentException("Local model endpoints must use localhost, 127.0.0.1, or ::1. Cloud providers are disabled in this release.");try(Connection c=provider.getConnection();PreparedStatement p=c.prepareStatement("UPDATE ai_settings SET memory_enabled=?,daily_briefing=?,provider_type=?,endpoint=?,model_name=?,response_style=?,cloud_consent=?,updated_at=? WHERE user_id=?")){p.setBoolean(1,value.memoryEnabled());p.setBoolean(2,value.dailyBriefing());p.setString(3,safe(value.providerType(),"DETERMINISTIC"));p.setString(4,safe(value.providerEndpoint(),""));p.setString(5,safe(value.modelName(),""));p.setString(6,safe(value.responseStyle(),"BALANCED"));p.setBoolean(7,value.cloudConsent());p.setTimestamp(8,Timestamp.from(Instant.now()));p.setLong(9,userId);p.executeUpdate();}}
    public AIProvider providerFor(Settings settings){String type=safe(settings.providerType(),"DETERMINISTIC").toUpperCase();if((type.equals("OLLAMA")||type.contains("LLAMA")||type.equals("LOCAL_GGUF"))&&!isLoopback(settings.providerEndpoint()))return new DeterministicFallbackProvider();return switch(type){
        case "OLLAMA"->new OllamaProvider(settings.providerEndpoint(),settings.modelName());
        case "LLAMA_CPP","LLAMA.CPP","LOCAL_GGUF"->new LocalModelProvider(settings.providerEndpoint(),settings.modelName());
        case "CLOUD"->new FutureCloudProvider();
        default->new DeterministicFallbackProvider();
    };}
    private void ensure(long userId)throws SQLException{try(Connection c=provider.getConnection();PreparedStatement q=c.prepareStatement("SELECT user_id FROM ai_settings WHERE user_id=?")){q.setLong(1,userId);try(ResultSet r=q.executeQuery()){if(r.next())return;}}try(Connection c=provider.getConnection();PreparedStatement p=c.prepareStatement("INSERT INTO ai_settings(user_id,memory_enabled,daily_briefing,provider_type,endpoint,model_name,response_style,cloud_consent,updated_at) VALUES(?,TRUE,TRUE,'DETERMINISTIC','','','BALANCED',FALSE,?)")){p.setLong(1,userId);p.setTimestamp(2,Timestamp.from(Instant.now()));p.executeUpdate();}catch(SQLIntegrityConstraintViolationException ignored){}}
    private static boolean isLoopback(String endpoint){if(endpoint==null||endpoint.isBlank())return true;try{String host=URI.create(endpoint.trim()).getHost();return host!=null&&(host.equalsIgnoreCase("localhost")||host.equals("127.0.0.1")||host.equals("::1"));}catch(Exception ignored){return false;}}
    private static String safe(String value,String fallback){return value==null||value.isBlank()?fallback:value.trim();}
}
