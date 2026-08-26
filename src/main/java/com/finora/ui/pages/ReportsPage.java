package com.finora.ui.pages;

import com.finora.brain.FinoraBrain;
import com.finora.model.TransactionRecord;
import com.finora.ui.Ui;
import com.finora.util.Money;
import javafx.collections.FXCollections;
import javafx.scene.Node;
import javafx.scene.chart.PieChart;
import javafx.scene.control.Label;
import javafx.scene.control.Separator;
import javafx.scene.control.ProgressBar;
import javafx.scene.layout.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Comparator;

public final class ReportsPage {
    private ReportsPage(){}
    public static Node build(FinoraBrain.BrainState state){VBox content=new VBox(22);content.getStyleClass().add("page-content");content.getChildren().add(Ui.row(Ui.sectionTitle("DECISION INTELLIGENCE","Reports & Analytics","Calculated from local records. No live market data, no invented comparisons."),Ui.spacer(),Ui.label("THIS MONTH","soft-chip")));
        BigDecimal surplus=state.snapshot().recordedIncome().subtract(state.snapshot().monthlyOutflow());BigDecimal rate=state.snapshot().recordedIncome().signum()==0?BigDecimal.ZERO:surplus.max(BigDecimal.ZERO).multiply(new BigDecimal("100")).divide(state.snapshot().recordedIncome(),1,RoundingMode.HALF_UP);GridPane stats=new GridPane();stats.setHgap(14);Ui.gridColumns(stats,25,25,25,25);stats.add(stat("INCOME",Money.inr(state.snapshot().recordedIncome()),"recorded inflow"),0,0);stats.add(stat("EXPENSES",Money.inr(state.snapshot().monthlyExpenses()),"excludes transfers"),1,0);stats.add(stat("DEBT REDUCTION",Money.inr(state.snapshot().monthlyDebtPayments()),"recorded payments"),2,0);stats.add(stat("SURPLUS RATE",rate+"%",Money.inr(surplus.max(BigDecimal.ZERO))+" before upcoming"),3,0);content.getChildren().add(stats);
        GridPane body=new GridPane();body.setHgap(18);Ui.gridColumns(body,48,52);body.add(spendingChart(state),0,0);body.add(monthlyReview(state),1,0);content.getChildren().add(body);content.getChildren().add(healthBreakdown(state));return Ui.scroll(content);}
    private static VBox spendingChart(FinoraBrain.BrainState state){var data=FXCollections.<PieChart.Data>observableArrayList();state.snapshot().expenseByCategory().entrySet().stream().sorted(java.util.Map.Entry.<String,BigDecimal>comparingByValue().reversed()).forEach(e->data.add(new PieChart.Data(e.getKey(),e.getValue().doubleValue())));PieChart chart=new PieChart(data);chart.setLegendVisible(true);chart.setLabelsVisible(false);chart.setMinHeight(330);chart.getStyleClass().add("spending-chart");return Ui.card(Ui.label("SPENDING MIX","eyebrow"),Ui.label("Where money went","section-title"),chart);}
    private static VBox monthlyReview(FinoraBrain.BrainState state){var top=state.snapshot().expenseByCategory().entrySet().stream().max(java.util.Map.Entry.comparingByValue());var largest=state.snapshot().transactions().stream().filter(t->t.type()==TransactionRecord.TransactionType.EXPENSE).max(Comparator.comparing(TransactionRecord::amount));VBox rows=new VBox(0);rows.getChildren().add(reviewRow("Top category",top.map(java.util.Map.Entry::getKey).orElse("No expense data"),top.map(e->Money.inr(e.getValue())).orElse("—")));rows.getChildren().add(reviewRow("Largest expense",largest.map(TransactionRecord::description).orElse("No expense data"),largest.map(t->Money.inr(t.amount())).orElse("—")));rows.getChildren().add(reviewRow("Net worth",Money.inr(state.snapshot().netWorth()),"Assets − liabilities"));rows.getChildren().add(reviewRow("Goal progress",state.snapshot().goals().size()+" active goals",Money.inr(state.snapshot().plannedGoalContributions())+" planned"));rows.getChildren().add(reviewRow("Prior-month comparison","Not enough local history","No claim generated"));Label insight=Ui.label(state.recommendations().getFirst().message(),"brain-quote-dark");insight.setWrapText(true);return Ui.card(Ui.label("MONTHLY REVIEW","eyebrow"),Ui.label("Your financial review","section-title"),rows,new Separator(),Ui.label("FINORA INSIGHT","field-label"),insight);}
    private static HBox reviewRow(String label,String value,String meta){VBox id=new VBox(4,Ui.label(label,"micro-label"),Ui.label(value,"priority-title"));HBox.setHgrow(id,Priority.ALWAYS);return Ui.row(id,Ui.label(meta,"review-meta"));}
    private static VBox healthBreakdown(FinoraBrain.BrainState state){HBox bars=new HBox(16);for(var e:state.health().factors().entrySet()){ProgressBar p=new ProgressBar(e.getValue()/100d);p.setPrefWidth(130);p.getStyleClass().add("factor-progress");VBox factor=new VBox(8,Ui.label(e.getKey().toUpperCase(),"micro-label"),Ui.label(e.getValue()+" / 100","mini-value"),p);HBox.setHgrow(factor,Priority.ALWAYS);bars.getChildren().add(factor);}return Ui.card(Ui.label("HEALTH BREAKDOWN","eyebrow"),Ui.label("Internal education score","section-title"),bars,Ui.label("This is not a credit score or professional financial rating.","assumption-label"));}
    private static VBox stat(String title,String value,String sub){VBox b=Ui.card(Ui.label(title,"eyebrow"),Ui.label(value,"stat-value"),Ui.label(sub,"stat-detail"));b.getStyleClass().add("summary-card");return b;}
}
