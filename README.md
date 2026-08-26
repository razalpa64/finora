# FINORA OS — Personal Financial Operating System (Web + Java Backend + Supabase)

**FINORA OS** is a calm, private, intelligent Personal Financial Operating System and Command Center. It converts raw financial data into verified mathematical insights, priority-based monthly plans, debt payoff strategies, and safe daily spending allowances.

---

## 🌟 What's New in FINORA OS 2.0

### 🚀 Modern Responsive Web Architecture
- **Full Web App with Live Preview**: Runs as a web application accessible from any desktop, tablet, or smartphone browser.
- **Mobile-First Redesign**: Touch-friendly navigation, mobile bottom navigation bar, floating quick-add button, responsive card feeds, and zero horizontal overflow.
- **Ultra-Modern Fintech UI**: Sleek dark fintech, midnight OLED, and daylight light themes with glassmorphism, animated health score rings, and real-time state reactivity.

### ⚡ Supabase PostgreSQL Database Integration
- **Full Supabase Support**: Direct integration with Supabase client (`@supabase/supabase-js`) and PostgreSQL database.
- **Row Level Security (RLS)**: Isolated multi-tenant security policies so each user only accesses their own records.
- **Cloud Sync & Migration**: Built-in Supabase configuration in Settings with 1-click connection test, data push/pull, and copyable SQL migration scripts.
- **Offline-First Resilience**: Seamless local storage and memory fallback for instant offline usage and sample demo exploration.

### ☕ Java Backend Architecture
- **Java 21 Core**: All original Java models (`com.finora.model.*`), DAO interfaces (`com.finora.dao.*`), services (`com.finora.service.*`), and brain engines (`com.finora.brain.*`) preserved and maintained.
- **Embedded Java Web Server (`FinoraWebServer.java`)**: REST API endpoints for `/api/health`, `/api/calculate/emi`, `/api/calculate/safe-to-spend`, `/api/brain/ask`, and static frontend hosting.
- **Supabase Postgres Provider (`SupabasePostgresProvider.java`)**: Native JDBC connection provider for Supabase connection poolers.

---

## 📊 Core Engines & Modules

1. **Financial Command Center (Overview)**
   - 6-Pillar Financial Health Score (0–100) with animated ring.
   - Live Net Worth (Total Assets vs Liabilities).
   - 4 Stat Cards: Monthly Income, Total Outflow, Monthly Surplus, Active Debt.
   - Today's Financial Snapshot (Safe to spend today, next due bill, emergency reserve, plan health).
   - Safe-to-Spend calculator with conservative 30% cash-flow buffer.
   - Priority Action Queue with severity indicators (Critical, Warning, Attention, Healthy).
   - Guided 3-Step Setup onboarding guide.

2. **Income Center**
   - Expected Monthly Plan vs Actually Received This Month.
   - Recurring income schedules (Weekly, Bi-weekly, Monthly, Quarterly, Annual).
   - 1-Click "Record Received" action that atomically credits the deposit account and advances next pay date.

3. **Money Movement (Transactions)**
   - Inflow, Outflow, and Net Movement analytics.
   - Multi-filter search (by type, category, account, and date).
   - Dynamic Add Transaction modal with atomic account balance updates.
   - Responsive desktop table and mobile card feed.
   - 1-Click CSV / JSON export.

4. **Monthly Control System (Plan)**
   - Priority-based suggested allocation (Essentials, Debt & EMI, Emergency, Goals, Investments, Flexible, Reserve).
   - Interactive "What-If" Income Shock Simulator (-50% to +50%) testing flexible capacity and obligation impact in real time.
   - Emergency Readiness gauge (months covered vs target).
   - Educational Investment Capacity Gate.
   - Category budget meters with over-budget alerts.

5. **Debt Center & EMI Engine**
   - Active liabilities list with balances, interest rates, and next due dates.
   - 5 Strategy Priority Orderings: Avalanche (Highest rate), Snowball (Lowest balance), Urgency (Nearest due), Hybrid (Multi-factor score), Personal (Manual priority).
   - Payoff Timeline Forecast (Estimated debt-free month & interest saved).
   - Standalone Reducing-Balance EMI Calculator.
   - Prepayment Comparison Simulator (Compare "Reduce Tenure" vs "Reduce EMI").
   - Record Debt Payment action with atomic liability reduction and source account charge.

6. **Purposeful Saving (Goals)**
   - Savings goals with target amounts, funded progress, deadlines, and priorities.
   - Completion date forecast and on-track status.
   - Goal Contribution action with safe earmarking that protects net worth.

7. **Bills & Calendar**
   - Due this week counter & upcoming payment timeline.
   - Digital Subscriptions tracker with last-used usage recording.
   - Mark paid/unpaid toggles.

8. **Decision Intelligence (Reports)**
   - Spending mix by category breakdown.
   - Monthly review (top category, largest single expense, net worth delta, goal pace).
   - 6-Pillar health breakdown (Savings, Debt, Emergency, Budget, Goals, Cash flow).

9. **FINORA Brain (AI Assistant)**
   - Tool-first deterministic intelligence: Understand → Retrieve → Calculate → Reason → Explain.
   - Verifiable answers with calculation steps, recommendations, assumptions, and `✓ VERIFIED` badge.
   - Multi-thread conversation history.
   - Structured AI memory manager (view, edit, delete explicit user preferences).
   - AI provider settings (Deterministic fallback, Local Ollama, llama.cpp, Cloud consent).

10. **System Control & Settings**
    - Supabase PostgreSQL cloud sync (URL, Anon Key, Test Connection, Push/Pull).
    - Multi-currency selector (INR ₹, USD $, EUR €, GBP £, JPY ¥, CAD $, AUD $, SGD $, AED, CHF).
    - Theme switcher (Dark Fintech, Daylight Light, Midnight OLED).
    - Asset Accounts & Wallets management.
    - Encrypted JSON Workspace Backup export and restore.

---

## 🛠️ Quick Start

### 1. Web Application (Development & Live Preview)

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Or build & start production server
npm run build
npm start
```

The web app is accessible at `http://localhost:3000`.

### 2. Java Backend & Web Server

```bash
# Compile with Maven
mvn clean compile

# Run Java Web Server
java -cp "target/classes:target/dependency/*" com.finora.web.FinoraWebServer 8080
```

### 3. Supabase Cloud Database Setup

1. Create a project on [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in your Supabase project dashboard.
3. Paste the contents of `supabase/schema.sql` (or copy it directly from FINORA **Settings → Supabase → View SQL Schema**) and click **Run**.
4. In FINORA OS, go to **Settings → Supabase**, enter your Project URL and Anon Key, and click **Test & Save Connection**.
