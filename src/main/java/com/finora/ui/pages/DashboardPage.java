package com.finora.ui.pages;

import com.finora.brain.*;
import com.finora.model.TransactionRecord;
import com.finora.ui.Icons;
import com.finora.ui.Ui;
import com.finora.util.Money;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Node;
import javafx.scene.chart.*;
import javafx.scene.control.*;
import javafx.scene.layout.*;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.Map;

public final class DashboardPage {
    private DashboardPage(){}
    public static Node build(FinoraBrain.BrainState state,String displayName,Runnable openBrain,Runnable openSettings,Runnable openIncome,Runnable openTransactions){
        var s=state.snapshot();VBox content=new VBox(24);content.getStyleClass().add("page-content");
        int hour=LocalTime.now().getHour();String greeting=hour<12?"Good morning":hour<17?"Good afternoon":"Good evening";
        HBox heading=Ui.row(Ui.sectionTitle("FINANCIAL COMMAND CENTER",greeting+", "+displayName,"Calculated only from the records in your local workspace."),Ui.spacer(),chip("●  LOCAL WORKSPACE","offline-chip"));
        content.getChildren().add(heading);
        boolean hasAccount=!s.accounts().isEmpty();boolean hasIncome=s.expectedRecurringIncome().signum()>0;boolean hasActivity=s.monthlyExpenses().signum()>0||!s.bills().isEmpty()||!s.debts().isEmpty();
        if(!(hasAccount&&hasIncome&&hasActivity))content.getChildren().add(setupGuideCard(hasAccount,hasIncome,hasActivity,openSettings,openIncome,openTransactions));

        GridPane hero=new GridPane();hero.setHgap(18);hero.setVgap(18);Ui.gridColumns(hero,34,66);
        VBox healthCard=healthCard(state.health(),s);GridPane.setRowSpan(healthCard,2);hero.add(healthCard,0,0);
        GridPane stats=new GridPane();stats.setHgap(14);stats.setVgap(14);Ui.gridColumns(stats,25,25,25,25);
        stats.add(statCard("MONTHLY INCOME",Money.inr(s.monthlyIncome()),s.usesRecurringIncomePlan()?"Expected · received "+Money.inr(s.recordedIncome()):"Recorded this month","positive"),0,0);
        stats.add(statCard("TOTAL OUTFLOW",Money.inr(s.monthlyOutflow()),"Expenses + debt payments","neutral"),1,0);
        BigDecimal savings=s.monthlyIncome().subtract(s.monthlyOutflow()).max(BigDecimal.ZERO);
        stats.add(statCard("MONTHLY SURPLUS",Money.inr(savings),"Before upcoming commitments","positive"),2,0);
        stats.add(statCard("ACTIVE DEBT",Money.inr(s.liabilities()),s.debts().size()+" open obligations","negative"),3,0);
        hero.add(stats,1,0);
        VBox daily=dailySnapshot(state);hero.add(daily,1,1);
        content.getChildren().add(hero);

        GridPane middle=new GridPane();middle.setHgap(18);middle.setVgap(18);Ui.gridColumns(middle,64,36);
        middle.add(cashFlowCard(state),0,0);middle.add(safeCard(state.safeToSpend()),1,0);content.getChildren().add(middle);

        GridPane bottom=new GridPane();bottom.setHgap(18);Ui.gridColumns(bottom,58,42);
        bottom.add(prioritiesCard(state),0,0);bottom.add(brainCard(state,openBrain),1,0);content.getChildren().add(bottom);
        return Ui.scroll(content);
    }
    private static VBox setupGuideCard(boolean account,boolean income,boolean activity,Runnable openSettings,Runnable openIncome,Runnable openTransactions){
        int complete=(account?1:0)+(income?1:0)+(activity?1:0);ProgressBar progress=new ProgressBar(complete/3d);progress.setMaxWidth(Double.MAX_VALUE);progress.getStyleClass().add("setup-progress");
        VBox rows=new VBox(0,guideRow("1","Create an account","Tell FINORA where money is held.",account,"Add account",openSettings,true),guideRow("2","Add monthly income","Create the income plan used by budgets and forecasts.",income,"Add income",openIncome,account),guideRow("3","Record your first outflow","Add spending, a bill or a debt so priorities become useful.",activity,"Add transaction",openTransactions,account));
        Label copy=Ui.label("Complete these steps in order. FINORA will recalculate the dashboard automatically after every entry.","body-copy");copy.setWrapText(true);
        VBox card=Ui.card(Ui.row(new VBox(4,Ui.label("GUIDED SETUP","eyebrow"),Ui.label("Set up FINORA in three steps","section-title")),Ui.spacer(),Ui.label(complete+" OF 3 COMPLETE","soft-chip")),progress,copy,rows);card.getStyleClass().add("onboarding-card");return card;
    }
    private static HBox guideRow(String number,String title,String copy,boolean complete,String action,Runnable handler,boolean enabled){
        StackPane badge=new StackPane(Ui.label(complete?"✓":number,"setup-step-number"));badge.getStyleClass().addAll("setup-step-badge",complete?"setup-step-done":"setup-step-open");Label detail=Ui.label(copy,"micro-copy");detail.setWrapText(true);VBox text=new VBox(4,Ui.label(title,"priority-title"),detail);HBox.setHgrow(text,Priority.ALWAYS);Button button=Ui.button(complete?"Completed":action,complete?"completed-button":"secondary-button");button.setDisable(complete||!enabled);button.setOnAction(event->handler.run());HBox row=Ui.row(badge,text,button);row.getStyleClass().add("setup-row");return row;
    }
    private static VBox healthCard(HealthScore health,FinancialSnapshot snapshot){
        Label score=Ui.label(String.valueOf(health.overall()),"health-number");Label of=Ui.label("/ 100","health-of");VBox value=new VBox(-2,score,of);value.setAlignment(Pos.CENTER);
        ProgressIndicator ring=new ProgressIndicator(health.overall()/100d);ring.getStyleClass().add("health-ring");ring.setMinSize(132,132);ring.setMaxSize(132,132);StackPane visual=new StackPane(ring,value);
        Label status=chip("●  "+health.label().toUpperCase(),"health-chip");
        HBox breakdown=Ui.row(new VBox(3,Ui.label("ASSETS","eyebrow-on-dark"),Ui.label(Money.inr(snapshot.assets()),"net-worth-mini")),Ui.spacer(),new VBox(3,Ui.label("LIABILITIES","eyebrow-on-dark"),Ui.label(Money.inr(snapshot.liabilities()),"net-worth-mini")));
        VBox card=new VBox(16,Ui.label("FINANCIAL HEALTH","eyebrow-on-dark"),visual,status,new Separator(),Ui.label("LIVE NET WORTH","eyebrow-on-dark"),Ui.label(Money.inr(snapshot.netWorth()),"net-worth-value"),breakdown,Ui.label("Updates after every recorded balance or liability change","on-dark-muted"));
        card.setAlignment(Pos.CENTER_LEFT);card.getStyleClass().addAll("card","health-card");return card;
    }
    private static VBox statCard(String title,String value,String sub,String tone){Label amount=Ui.label(value,"stat-value",tone);Label detail=Ui.label(sub,"stat-detail");detail.setWrapText(true);VBox card=Ui.card(Ui.label(title,"eyebrow"),amount,detail);card.getStyleClass().add("stat-card");return card;}
    private static VBox dailySnapshot(FinoraBrain.BrainState state){
        HBox title=Ui.row(Ui.label("TODAY'S FINANCIAL SNAPSHOT","section-title"),Ui.spacer(),Ui.label(state.snapshot().asOf().format(DateTimeFormatter.ofPattern("EEEE, dd MMMM")),"muted"));
        GridPane grid=new GridPane();grid.setHgap(10);Ui.gridColumns(grid,25,25,25,25);
        grid.add(mini("SAFE TO SPEND",Money.inr(state.safeToSpend().today()),"today"),0,0);
        var next=state.snapshot().bills().stream().filter(b->!b.paid()).min(Comparator.comparing(b->b.dueDate()));grid.add(mini("NEXT PAYMENT",next.map(b->Money.inr(b.amount())).orElse("—"),next.map(b->b.name()).orElse("No bill due")),1,0);
        grid.add(mini("RESERVE",Money.inr(state.snapshot().emergencyFund()),"emergency fund"),2,0);
        grid.add(mini("PLAN HEALTH",state.monthlyPlan().score()+" / 100","monthly allocation"),3,0);
        VBox box=Ui.card(title,grid);box.getStyleClass().add("daily-card");return box;
    }
    private static VBox mini(String title,String value,String sub){VBox box=new VBox(5,Ui.label(title,"micro-label"),Ui.label(value,"mini-value"),Ui.label(sub,"micro-copy"));box.getStyleClass().add("mini-stat");return box;}
    private static VBox cashFlowCard(FinoraBrain.BrainState state){
        CategoryAxis x=new CategoryAxis();NumberAxis y=new NumberAxis();y.setForceZeroInRange(false);y.setTickLabelsVisible(false);y.setTickMarkVisible(false);y.setMinorTickVisible(false);x.setTickMarkVisible(false);
        AreaChart<String,Number> chart=new AreaChart<>(x,y);chart.setLegendVisible(false);chart.setCreateSymbols(false);chart.setAnimated(false);chart.getStyleClass().add("cash-chart");chart.setMinHeight(250);
        XYChart.Series<String,Number> series=new XYChart.Series<>();Map<Integer,BigDecimal> daily=new LinkedHashMap<>();
        state.snapshot().transactions().stream().sorted(Comparator.comparing(TransactionRecord::date)).forEach(t->{int day=t.date().getDayOfMonth();BigDecimal signed=t.type()==TransactionRecord.TransactionType.INCOME?t.amount():t.amount().negate();daily.merge(day,signed,BigDecimal::add);});
        BigDecimal running=BigDecimal.ZERO;for(var e:daily.entrySet()){running=running.add(e.getValue());series.getData().add(new XYChart.Data<>(String.format("%02d",e.getKey()),running));}if(series.getData().size()<2){series.getData().add(new XYChart.Data<>("01",0));series.getData().add(new XYChart.Data<>("Now",running));}chart.getData().add(series);
        HBox header=Ui.row(new VBox(4,Ui.label("CASH FLOW","eyebrow"),Ui.label("Income vs outflow","section-title")),Ui.spacer(),chip("THIS MONTH","soft-chip"));
        HBox legend=Ui.row(Ui.severityDot("healthy"),Ui.label("Net recorded movement","micro-copy"),Ui.spacer(),Ui.label("Net movement "+Money.inr(running),"chart-total"));
        VBox card=Ui.card(header,chart,legend);return card;
    }
    private static VBox safeCard(SafeToSpendResult safe){
        Label amount=Ui.label(Money.inr(safe.today()),"safe-value");Label copy=Ui.label("available today","safe-copy");
        ProgressBar p=new ProgressBar(safe.operatingCapacity().signum()==0?0:safe.flexibleRemaining().divide(safe.operatingCapacity(),4,java.math.RoundingMode.HALF_UP).doubleValue());p.getStyleClass().add("safe-progress");p.setMaxWidth(Double.MAX_VALUE);
        GridPane breakdown=new GridPane();breakdown.setHgap(10);Ui.gridColumns(breakdown,50,50);breakdown.add(mini("FLEXIBLE",Money.inr(safe.flexibleRemaining()),"remaining"),0,0);breakdown.add(mini("PROTECTED",Money.inr(safe.protectedReserve()),"reserve"),1,0);
        Label reason=Ui.label(safe.explanation(),"body-copy");reason.setWrapText(true);
        VBox card=Ui.card(Ui.row(Ui.label("SAFE TO SPEND","eyebrow"),Ui.spacer(),chip(safe.remainingDays()+" DAYS LEFT","soft-chip")),amount,copy,p,breakdown,reason);card.getStyleClass().add("safe-card");return card;
    }
    private static VBox prioritiesCard(FinoraBrain.BrainState state){VBox list=new VBox(0);int i=0;for(Recommendation r:state.recommendations()){if(i++>=3)break;HBox row=Ui.row(Ui.severityDot(r.severity().name()),new VBox(4,Ui.label(r.title(),"priority-title"),wrap(r.message(),"micro-copy")),Ui.spacer(),Icons.create("arrow",16));row.getStyleClass().add("priority-row");list.getChildren().add(row);}VBox card=Ui.card(Ui.row(new VBox(4,Ui.label("PRIORITY QUEUE","eyebrow"),Ui.label("What needs to happen next","section-title")),Ui.spacer(),chip(state.recommendations().size()+" SIGNALS","soft-chip")),list);return card;}
    private static VBox brainCard(FinoraBrain.BrainState state,Runnable openBrain){Recommendation insight=state.recommendations().getFirst();Label message=wrap("“"+insight.message()+"”","brain-quote");Button button=Ui.button("Ask FINORA Brain  →","ghost-on-purple");button.setOnAction(e->openBrain.run());VBox card=new VBox(14,Ui.row(Icons.create("brain",20),Ui.label("FINORA BRAIN","eyebrow-on-purple")),message,Ui.label("WHY THIS MATTERS","micro-on-purple"),wrap(insight.fact(),"on-purple-copy"),button);card.getStyleClass().addAll("card","brain-card");return card;}
    private static Label chip(String text,String cls){Label l=Ui.label(text,cls);return l;}
    private static Label wrap(String text,String cls){Label l=Ui.label(text,cls);l.setWrapText(true);return l;}
}
