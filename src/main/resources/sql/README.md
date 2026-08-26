# SQL schema

The authoritative cross-database schema is created by `com.finora.database.DatabaseInitializer`.
It selects the correct identity syntax for H2 or MySQL, creates indexes through JDBC metadata,
and runs inside a transaction during database initialization.
