package com.finora.service;

import com.finora.database.ConnectionProvider;
import com.finora.database.DatabaseType;

import java.io.*;
import java.nio.file.*;
import java.sql.*;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

public final class BackupService {
    private static final DateTimeFormatter STAMP = DateTimeFormatter.ofPattern("yyyy_MM_dd_HHmmss");
    private final ConnectionProvider database;
    private final Path directory;
    public BackupService(ConnectionProvider database, Path directory) { this.database=database;this.directory=directory.toAbsolutePath(); }

    public Path backup() throws SQLException, IOException {
        if (database.type()!= DatabaseType.H2) throw new IllegalStateException("Local backup is available for H2 workspaces only.");
        Files.createDirectories(directory);
        Path output=directory.resolve("finora_backup_"+LocalDateTime.now().format(STAMP)+".zip");
        if(Files.exists(output)) throw new FileAlreadyExistsException(output.toString());
        Path script=directory.resolve("."+UUID.randomUUID()+".sql");
        try {
            String safe=script.toString().replace("'","''");
            try(Connection c=database.getConnection();Statement s=c.createStatement()){s.execute("SCRIPT TO '"+safe+"'");}
            try(ZipOutputStream zip=new ZipOutputStream(Files.newOutputStream(output,StandardOpenOption.CREATE_NEW))){
                zip.putNextEntry(new ZipEntry("finora.sql"));Files.copy(script,zip);zip.closeEntry();
            }
            return output;
        } catch (Exception exception) {
            Files.deleteIfExists(output);
            if(exception instanceof SQLException sql)throw sql;
            if(exception instanceof IOException io)throw io;
            throw new IOException(exception);
        } finally { Files.deleteIfExists(script); }
    }
    public void restore(Path backup) throws SQLException, IOException {
        if(database.type()!=DatabaseType.H2)throw new IllegalStateException("Restore is available for H2 workspaces only.");
        Path normalized=backup.toAbsolutePath().normalize();
        if(!normalized.startsWith(directory.normalize())||!Files.isRegularFile(normalized))throw new IllegalArgumentException("Select a valid FINORA backup.");
        Path script=Files.createTempFile(directory,".finora_restore_",".sql");
        try(ZipInputStream zip=new ZipInputStream(Files.newInputStream(normalized))){
            ZipEntry entry=zip.getNextEntry();if(entry==null||!"finora.sql".equals(entry.getName()))throw new IOException("The backup does not contain a FINORA SQL script.");
            Files.copy(zip,script,StandardCopyOption.REPLACE_EXISTING);
        }
        try {
            String safe=script.toString().replace("'","''");
            try(Connection c=database.getConnection();Statement s=c.createStatement()){
                s.execute("DROP ALL OBJECTS");s.execute("RUNSCRIPT FROM '"+safe+"'");
            }
        } finally { Files.deleteIfExists(script); }
    }
    public List<Path> list() throws IOException {
        if(!Files.exists(directory))return List.of();
        try(var stream=Files.list(directory)){return stream.filter(p->p.getFileName().toString().startsWith("finora_backup_")&&p.getFileName().toString().endsWith(".zip")).sorted(Comparator.reverseOrder()).toList();}
    }
}
