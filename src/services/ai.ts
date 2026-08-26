import { AIMessage, AISettings, BrainState } from '../types';
import { askFinoraBrain } from './brain';
import { formatMoney } from './currency';

export interface AIResponseOutput {
  text: string;
  intent: string;
  toolsUsed: string[];
  verified: boolean;
  calculations: string[];
}

export async function processAIRequest(
  userQuery: string,
  state: BrainState,
  history: AIMessage[],
  settings: AISettings,
  currencyCode = 'INR'
): Promise<AIResponseOutput> {
  const q = userQuery.trim().toLowerCase();

  // 1. Tool execution via deterministic FINORA Brain
  const brainRes = askFinoraBrain(userQuery, state, currencyCode);

  let responseMarkdown = '';
  const toolsUsed: string[] = [];

  // Determine intent & tools used
  if (brainRes.intent === 'SAFE_TO_SPEND') {
    toolsUsed.push('BudgetEngine.safeToSpend', 'CashFlowEngine.snapshot');
    responseMarkdown = `### Safe to Spend
## ${brainRes.headline}

${brainRes.summary}

**Calculated Breakdown:**
${brainRes.calculations.map((c) => `- ${c}`).join('\n')}

**Recommendation:**
${brainRes.recommendations.map((r) => `- ${r}`).join('\n')}

*Assumption: ${brainRes.assumptions[0]}*`;
  } else if (brainRes.intent === 'AFFORDABILITY') {
    toolsUsed.push('CashFlowEngine.snapshot', 'BudgetEngine.safeToSpend');
    responseMarkdown = `### Affordability Assessment
## ${brainRes.headline}

${brainRes.summary}

**Facts Considered:**
${brainRes.calculations.map((c) => `- ${c}`).join('\n')}

**Guidance:**
${brainRes.recommendations.map((r) => `- ${r}`).join('\n')}

*${brainRes.assumptions[0]}*`;
  } else if (brainRes.intent === 'DEBT_PRIORITY') {
    toolsUsed.push('DebtEngine.prioritize', 'DebtEngine.recommendStrategy');
    responseMarkdown = `### Priority Debt Repayment
## ${brainRes.headline}

${brainRes.summary}

**Prioritized Obligations:**
${brainRes.calculations.map((c) => `- ${c}`).join('\n')}

**Actionable Rule:**
${brainRes.recommendations.map((r) => `- ${r}`).join('\n')}

*${brainRes.assumptions[0]}*`;
  } else if (brainRes.intent === 'DEBT_FREE_FORECAST') {
    toolsUsed.push('DebtEngine.forecast');
    responseMarkdown = `### Debt-Free Timeline
## ${brainRes.headline}

${brainRes.summary}

**Forecast Details:**
${brainRes.calculations.map((c) => `- ${c}`).join('\n')}

**Strategy Tip:**
${brainRes.recommendations.map((r) => `- ${r}`).join('\n')}`;
  } else if (brainRes.intent === 'FINANCIAL_HEALTH') {
    toolsUsed.push('FinancialHealthEngine.calculate');
    responseMarkdown = `### Financial Health Analysis
## Overall Score: ${brainRes.headline}

${brainRes.summary}

**6-Pillar Sub-scores:**
${brainRes.calculations.map((c) => `- ${c}`).join('\n')}

**Priority Action:**
${brainRes.recommendations.map((r) => `- ${r}`).join('\n')}`;
  } else if (brainRes.intent === 'SPENDING_ANALYSIS') {
    toolsUsed.push('CashFlowEngine.expenseByCategory');
    responseMarkdown = `### Spending Breakdown
## ${brainRes.headline}

${brainRes.summary}

**Top Expense Categories:**
${brainRes.calculations.map((c) => `- ${c}`).join('\n')}

**Action:**
${brainRes.recommendations.map((r) => `- ${r}`).join('\n')}`;
  } else if (brainRes.intent === 'SAVINGS_CAPACITY') {
    toolsUsed.push('BudgetEngine.createPlan', 'EmergencyFundEngine.calculate');
    responseMarkdown = `### Monthly Savings & Allocations
## ${brainRes.headline}

${brainRes.summary}

**Allocations:**
${brainRes.calculations.map((c) => `- ${c}`).join('\n')}

**Next Steps:**
${brainRes.recommendations.map((r) => `- ${r}`).join('\n')}`;
  } else if (brainRes.intent === 'INCOME_SHOCK') {
    toolsUsed.push('ScenarioPlanner.incomeShock');
    responseMarkdown = `### Income Shock Scenario
## ${brainRes.headline}

${brainRes.summary}

**Scenario Impact:**
${brainRes.calculations.map((c) => `- ${c}`).join('\n')}

**Action Plan:**
${brainRes.recommendations.map((r) => `- ${r}`).join('\n')}`;
  } else if (brainRes.intent === 'EMI_CAPACITY') {
    toolsUsed.push('EMIEngine.calculateCapacity', 'BudgetEngine.createPlan');
    responseMarkdown = `### EMI & Loan Capacity
## ${brainRes.headline}

${brainRes.summary}

**Plan Numbers:**
${brainRes.calculations.map((c) => `- ${c}`).join('\n')}

**Recommendation:**
${brainRes.recommendations.map((r) => `- ${r}`).join('\n')}`;
  } else if (brainRes.intent === 'UPCOMING_OBLIGATIONS') {
    toolsUsed.push('CalendarEngine.timeline');
    responseMarkdown = `### Upcoming Bills & Commitments
## ${brainRes.headline}

${brainRes.summary}

**Due Schedule:**
${brainRes.calculations.map((c) => `- ${c}`).join('\n')}

**Safety Rule:**
${brainRes.recommendations.map((r) => `- ${r}`).join('\n')}`;
  } else if (brainRes.intent === '30_DAY_FORECAST') {
    toolsUsed.push('ForecastEngine.daily');
    responseMarkdown = `### 30-Day Cash Flow Forecast
## ${brainRes.headline}

${brainRes.summary}

**Forecast Markers:**
${brainRes.calculations.map((c) => `- ${c}`).join('\n')}

**Advice:**
${brainRes.recommendations.map((r) => `- ${r}`).join('\n')}`;
  } else {
    // General overview / Daily briefing
    toolsUsed.push('FinoraBrain.analyze');
    responseMarkdown = `### FINORA Financial Overview
## Calm, Verified Financial Intelligence

Here is a summary of your current financial state:

- **Net Worth:** ${formatMoney(state.snapshot.netWorth, currencyCode)} (${formatMoney(state.snapshot.assets, currencyCode)} assets, ${formatMoney(state.snapshot.liabilities, currencyCode)} liabilities)
- **Safe to Spend Today:** ${formatMoney(state.safeToSpend.today, currencyCode)} (with a 30% cash-flow buffer)
- **Financial Health Score:** ${state.health.overall} / 100 (${state.health.label})
- **Active Obligations:** ${state.snapshot.debts.length} debt(s) totaling ${formatMoney(state.snapshot.liabilities, currencyCode)}
- **Emergency Reserve:** ${formatMoney(state.snapshot.emergencyFund, currencyCode)}

Ask me anything specific like *"Can I afford a ₹25,000 purchase?"*, *"Who should I pay first?"*, or *"What is safe to spend today?"*.`;
  }

  return {
    text: responseMarkdown,
    intent: brainRes.intent,
    toolsUsed,
    verified: true,
    calculations: brainRes.calculations,
  };
}
