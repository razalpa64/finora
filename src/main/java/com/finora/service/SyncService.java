package com.finora.service;

import com.finora.database.ConnectionProvider;
import com.finora.database.DatabaseManager;

import java.sql.*;
import java.time.Instant;
import java.util.List;

/** Conflict-aware synchronization foundation. It never resolves a conflict by overwriting a row silently. */
public final class SyncService {
    public record SyncSummary(int added, int updated, int deleted, int conflicts, Instant completedAt) {}
    private static final List<String> ENTITIES=List.of("accounts","income_sources","financial_transactions","debts","goals","bills","investments","budgets");
    private final DatabaseManager local;
    public SyncService(DatabaseManager local){this.local=local;}

    public SyncSummary analyze(ConnectionProvider remote, Instant lastSync) throws SQLException {
        int added=0,updated=0,deleted=0,conflicts=0;
        try(Connection lc=local.getConnection();Connection rc=remote.getConnection()){
            for(String table:ENTITIES){
                // Cross-connection joins are not portable. Compare lightweight version maps instead.
                var localVersions=versions(lc,table);var remoteVersions=versions(rc,table);
                for(var entry:localVersions.entrySet()){
                    Version rv=remoteVersions.get(entry.getKey());Version lv=entry.getValue();
                    if(rv==null){if(lv.deleted)deleted++;else added++;continue;}
                    boolean lChanged=lv.updated.isAfter(lastSync);boolean rChanged=rv.updated.isAfter(lastSync);
                    if(lChanged&&rChanged&&!lv.updated.equals(rv.updated))conflicts++;
                    else if(lChanged&&!lv.updated.equals(rv.updated))updated++;
                }
            }
        }
        return new SyncSummary(added,updated,deleted,conflicts,Instant.now());
    }
    private record Version(Instant updated,boolean deleted){}
    private static java.util.Map<Long,Version> versions(Connection c,String table)throws SQLException{
        java.util.Map<Long,Version> out=new java.util.HashMap<>();
        try(Statement s=c.createStatement();ResultSet r=s.executeQuery("SELECT id,updated_at,deleted FROM "+table)){
            while(r.next())out.put(r.getLong(1),new Version(r.getTimestamp(2).toInstant(),r.getBoolean(3)));}
        return out;
    }
}
