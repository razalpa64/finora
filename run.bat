@echo off
setlocal
where java >nul 2>nul
if errorlevel 1 (
  echo Java 21 or newer is required.
  exit /b 1
)
where mvn >nul 2>nul
if errorlevel 1 (
  echo Maven 3.9 or newer is required.
  exit /b 1
)
mvn javafx:run
