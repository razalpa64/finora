# FINORA OS

**FINORA OS** is an offline-first Personal Financial Operating System for Java 21 and JavaFX. It is designed as a calm, private financial command center rather than a basic expense log.

FINORA calculates from locally stored records. It does not call an online AI service, invent missing financial data, promise investment returns, or treat internal health scores as professional ratings.

## What is implemented

### Premium desktop experience

- Original light and dark fintech design system with an integrated compact command bar and an uninterrupted top-to-bottom sidebar
- Responsive desktop shell with width-and-height-aware compact navigation, safe visual-bound margins for 720p laptops, native maximize and F11 true full-screen mode
- Guided three-stage startup screen tied to real database, session and FINORA Brain work, with a two-second minimum readable display time
- Multiple private local profiles with prominent **Sign in** and **Create account** tabs on the first screen, secure registration, logout-based switching, and isolated financial workspaces
- Optional 30-day “Keep me signed in” session using a revocable random device token—never a saved password
- Always-visible **Log out** action in the top bar, profile-menu fallback and Ctrl+Shift+L shortcut; logging out revokes the remembered-device session
- Persistent three-step dashboard setup guide, global help and an expanded Quick Add menu
- Command-center dashboard, vector navigation icons, data cards, charts, tables, progress visuals, dialogs, loading states and toast feedback
- Overview, Transactions, Monthly Plan, Debt Center, Goals, Bills & Calendar, Reports, FINORA Brain and Settings screens

### Local financial intelligence

- `CashFlowEngine` — derives income, expense, essential-cost and upcoming-obligation facts
- `BudgetEngine` — calculates safe-to-spend and a priority-ordered monthly allocation
- `DebtEngine` — avalanche, snowball, urgency, hybrid and personal-priority ordering plus payoff forecasts
- `EMIEngine` — reducing-balance EMI, total interest, repayment and prepayment comparisons
- `EmergencyFundEngine` — stability-adjusted three/six/nine-month reserve targets
- `GoalEngine` — priority ordering, required contribution and completion forecast
- `InvestmentEngine` — educational capacity gating and allocation; no guaranteed return assumptions
- `ForecastEngine` — event-driven 30-day and six-month cash-flow projections
- `FinancialHealthEngine` — transparent 0–100 internal score with factor breakdown
- `RecommendationEngine` — severity-ranked next actions with facts and assumptions
- `FinoraBrain` — deterministic state analysis for safe spending, affordability, debt order, debt-free timing, health, bills, savings, income shocks, EMI capacity, forecasts and debt-vs-invest decisions
- `FinoraAIEngine` — tool-first orchestration using Understand → Retrieve → Calculate → Reason → Explain → Remember
- Provider-neutral `AIProvider` contract with deterministic fallback, Ollama and local llama.cpp/GGUF-service adapters; local endpoints are restricted to loopback addresses
- Database-backed tools for balances, net worth, income, transactions, spending, budgets, debts, EMI, goals, bills, investments, affordability, forecasts, health and monthly plans
- Structured user-controlled AI memory with relevance/decay ranking, 200-item growth cap, edit/delete/clear/disable controls and database-truth priority
- Searchable local conversations capped at 30 conversations and 200 messages per conversation, with new/delete, copy, regenerate and stop controls
- Embedded educational knowledge retrieval and response validation that withholds unverified local-model numbers or guaranteed-return language

### Working financial operations

- Account creation and balances
- Dedicated Income Center with recurring source schedules, monthly-equivalent calculations and receipt recording
- Clear separation between expected monthly income and income actually received this month
- Income, expense, transfer, debt/EMI payment, goal and investment transaction types
- Atomic balance updates for all money movement
- Debt creation, payment and prioritization
- Goal creation and atomic earmarking contributions that do not destroy account assets or net worth
- Bills, subscriptions, due-date timeline and recorded-usage context
- Category budgets and monthly review analytics
- Net worth and emergency-reserve calculation
- Empty-by-default embedded H2 workspace with no sample balances, names or transactions
- Per-profile ownership on accounts, income, transactions, debts, goals, bills, budgets, investments, net-worth history, AI memory and conversations
- Cross-profile reads and mutations rejected in prepared DAO queries, including guessed record IDs
- Existing unscoped financial records are migrated once to the original profile; newly created profiles start empty
- Local profile credentials derived with PBKDF2-HMAC-SHA256, random salt and sign-in throttling
- Optional MySQL session connection with TLS required and no hard-coded credentials
- Timestamped ZIP-script backup and confirmed restore
- Synchronization version/conflict analysis foundation using IDs, `updated_at` and soft-delete markers

## Architecture

```text
JavaFX UI
   ↓
Page / application controllers
   ↓
Services and atomic operations
   ↓
FINORA Brain engines
   ↓
DAO interfaces
   ↓
JDBC DAO implementation
   ↓
H2 Embedded / MySQL
```

Important boundaries are enforced in the source:

- Brain classes contain no JavaFX references.
- DAO classes contain no UI logic.
- Pages do not contain SQL.
- Monetary values use `BigDecimal`.
- Variable SQL input uses `PreparedStatement`.
- Transfers, debt payments and goal contributions use JDBC transactions.
- Heavy initialization, refreshes and database actions run off the JavaFX application thread.

## Requirements

- JDK 21+
- Maven 3.9+
- Windows, macOS or Linux desktop environment

## Run

### From Maven

```bash
cd FINORA
mvn clean javafx:run
```

### Windows portable package — recommended

The portable Windows distribution contains `FINORA.exe`, a private Java 21 runtime, and a diagnostic batch launcher. Extract the complete ZIP, keep the `runtime` folder beside the executable, and double-click `FINORA.exe`. It does not depend on the computer's `.jar` association or installed Java version.

Build the Windows launcher with:

```bash
mvn clean package -Djavafx.platform=win -Pwindows-portable
```

### As a self-contained JavaFX JAR

Build on the operating system where FINORA will run so Maven includes that platform's JavaFX native libraries:

```bash
cd FINORA
mvn clean package
java -jar target/finora-os-1.0.0.jar
```

The packaged JAR includes JavaFX, H2, MySQL Connector/J and the other runtime dependencies. Its manifest uses `com.finora.Launcher`, a classpath-safe entry point separate from the JavaFX `Application` subclass.

Do **not** run `target/original-finora-os-1.0.0.jar`; that is the thin pre-shading artifact and does not contain JavaFX runtime components.

The first local launch creates the embedded H2 database in the operating system's per-user application-data directory:

```text
Windows: %LOCALAPPDATA%\FINORA\data\finora.mv.db
macOS:   ~/Library/Application Support/FINORA/data/finora.mv.db
Linux:   ~/.local/share/finora/data/finora.mv.db
```

A previous `data/finora.mv.db` beside the application is copied into the stable location once when needed. FINORA then asks the first owner to create a local username and password. After a profile exists, the sign-in screen provides **Create another private profile**. Every new profile starts with a completely empty financial workspace—no sample accounts, names, balances, transactions, bills or debts are inserted. Legacy data explicitly marked `workspace_mode=DEMO` by a previous build is removed during migration; unmarked real data is preserved and assigned to the original profile.

## Build and test

```bash
mvn clean test
mvn clean package
```

The automated suite covers:

- EMI and prepayment calculations
- Debt-priority ordering
- Empty-by-default H2 schema initialization and legacy-demo removal
- PBKDF2 local profile registration, authentication and invalid-password rejection
- End-to-end local FINORA Brain calculations without invented values
- Live net-worth movement and goal-earmarking invariants
- Financial intent routing, exact database-backed answers and deterministic EMI calculations
- Financial-record, AI-conversation and AI-memory isolation across multiple authenticated profiles
- Memory controls, provider fallback and anti-hallucination response validation
- Rejection of remote endpoints masquerading as local private models
- Timestamped backup creation and restore

## Local data and backup

- Default database: the OS-specific FINORA data directory shown above
- Backups: the sibling `backups/finora_backup_yyyy_MM_dd_HHmmss.zip` directory
- Backups never overwrite an existing file automatically.
- Restore requires an explicit confirmation and is available for the local H2 workspace.

To create a completely new local owner workspace, close FINORA and move the OS-specific `finora.mv.db` file to a safe backup location before relaunching. Deleting that file removes both the local profile and financial records, so retain a backup when needed.

## MySQL

Open **Settings → Workspace → MySQL** and enter connection details. Credentials remain in memory for the session and are not written to source code or UI logs. The connector uses `sslMode=REQUIRED` and disables public-key retrieval.

FINORA never silently resolves synchronization conflicts. `SyncService` compares record versions and reports local additions, updates, deletions and conflicts for explicit resolution. Applying a full two-way synchronization policy should be tailored to the deployment's ownership and retention rules before production rollout.

## Financial safety

FINORA UI responses distinguish:

- **Calculated fact** — directly derived from stored records
- **Recommendation** — a deterministic planning suggestion
- **Assumption** — a condition required by a forecast or recommendation

All investment output is educational. The application does not provide regulated investment advice, live market prices or guaranteed outcomes.
#   f i n o r a  
 