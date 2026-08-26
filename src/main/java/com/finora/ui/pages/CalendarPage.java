package com.finora.ui.pages;

import com.finora.brain.FinoraBrain;
import com.finora.model.Bill;
import com.finora.model.Debt;
import com.finora.model.FinancialEvent;
import com.finora.ui.Icons;
import com.finora.ui.PageContext;
import com.finora.ui.Ui;
import com.finora.util.Money;
import javafx.collections.FXCollections;
import javafx.scene.Node;
import javafx.scene.control.*;
import javafx.scene.layout.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public final class CalendarPage {
    private CalendarPage(){}
    public static Node build(FinoraBrain.BrainState state,PageContext ctx){VBox content=new VBox(22);content.getStyleClass().add("page-content");Button add=Ui.button("Add bill","primary-button");add.setGraphic(Icons.create("plus",16));add.setOnAction(e->addBill(ctx));content.getChildren().add(Ui.row(Ui.sectionTitle("FINANCIAL CALENDAR","Bills & Subscriptions","See every due date before it becomes a cash-flow surprise."),Ui.spacer(),add));
        LocalDate today=LocalDate.now();List<Bill> bills=state.snapshot().bills();BigDecimal week=bills.stream().filter(b->!b.paid()&&!b.dueDate().isAfter(today.plusDays(7))).map(Bill::amount).reduce(BigDecimal.ZERO,BigDecimal::add);BigDecimal subscriptions=bills.stream().filter(Bill::subscription).map(Bill::amount).reduce(BigDecimal.ZERO,BigDecimal::add);GridPane stats=new GridPane();stats.setHgap(14);Ui.gridColumns(stats,33,33,34);stats.add(stat("DUE THIS WEEK",Money.inr(week),bills.stream().filter(b->!b.paid()&&!b.dueDate().isAfter(today.plusDays(7))).count()+" payments"),0,0);stats.add(stat("MONTHLY SUBSCRIPTIONS",Money.inr(subscriptions),"recorded recurring services"),1,0);stats.add(stat("UPCOMING OBLIGATIONS",Money.inr(state.snapshot().upcomingBills().add(state.snapshot().upcomingDebtCommitments())),"bills + debt commitments"),2,0);content.getChildren().add(stats);
        GridPane body=new GridPane();body.setHgap(18);body.setAlignment(javafx.geometry.Pos.TOP_LEFT);Ui.gridColumns(body,62,38);body.add(timeline(state),0,0);body.add(subscriptions(state),1,0);content.getChildren().add(body);return Ui.scroll(content);}
    private static VBox timeline(FinoraBrain.BrainState state){List<FinancialEvent> events=new ArrayList<>();for(Bill b:state.snapshot().bills())events.add(new FinancialEvent(b.dueDate(),b.name(),b.subscription()?"SUBSCRIPTION":"BILL",b.amount(),false,b.paid()?"PAID":"DUE"));for(Debt d:state.snapshot().debts())if(d.dueDate()!=null)events.add(new FinancialEvent(d.dueDate(),d.name(),"DEBT",d.minimumPayment().min(d.remainingAmount()),false,"DUE"));events.sort(Comparator.comparing(FinancialEvent::date));VBox list=new VBox(0);LocalDate today=LocalDate.now();for(FinancialEvent event:events){long days=ChronoUnit.DAYS.between(today,event.date());String urgency=days<0?"critical":days<=3?"warning":days<=7?"attention":"healthy";VBox date=new VBox(1,Ui.label(event.date().format(DateTimeFormatter.ofPattern("MMM")).toUpperCase(),"micro-label"),Ui.label(String.format("%02d",event.date().getDayOfMonth()),"calendar-day"));date.setMinWidth(55);VBox info=new VBox(4,Ui.label(event.title(),"priority-title"),Ui.label(event.type()+" · "+(days==0?"Due today":days<0?Math.abs(days)+" days overdue":"in "+days+" days"),"muted"));HBox.setHgrow(info,Priority.ALWAYS);Label amount=Ui.label(Money.inr(event.amount()),"debt-amount");HBox row=Ui.row(date,Ui.severityDot(urgency),info,amount);row.getStyleClass().add("calendar-row");list.getChildren().add(row);}if(events.isEmpty())list.getChildren().add(Ui.label("No events are recorded for this period.","empty-copy"));return Ui.card(Ui.row(new VBox(4,Ui.label("UPCOMING","eyebrow"),Ui.label("Payment timeline","section-title")),Ui.spacer(),Ui.label(events.size()+" EVENTS","soft-chip")),list);}
    private static VBox subscriptions(FinoraBrain.BrainState state){VBox list=new VBox(0);for(Bill b:state.snapshot().bills().stream().filter(Bill::subscription).toList()){long days=b.lastUsedDate()==null?-1:ChronoUnit.DAYS.between(b.lastUsedDate(),LocalDate.now());String usage=b.lastUsedDate()==null?"Usage not recorded":"Last marked used "+days+" days ago";Label name=Ui.label(b.name(),"priority-title");Label meta=Ui.label(usage,"micro-copy");VBox id=new VBox(4,name,meta);HBox.setHgrow(id,Priority.ALWAYS);VBox amount=new VBox(3,Ui.label(Money.inr(b.amount()),"debt-amount"),Ui.label("/ month","micro-copy"));HBox row=Ui.row(id,amount);row.getStyleClass().add("priority-row");list.getChildren().add(row);}Label note=Ui.label("FINORA only flags recorded usage. It never assumes a service is unused.","body-copy");note.setWrapText(true);return Ui.card(Ui.label("SUBSCRIPTIONS","eyebrow"),Ui.label("Recurring services","section-title"),list,new Separator(),note);}
    private static VBox stat(String title,String value,String sub){VBox b=Ui.card(Ui.label(title,"eyebrow"),Ui.label(value,"stat-value"),Ui.label(sub,"stat-detail"));b.getStyleClass().add("summary-card");return b;}
    private static void addBill(PageContext ctx){Dialog<ButtonType>d=new Dialog<>();d.setTitle("Add bill");d.initOwner(ctx.owner().get());ButtonType save=new ButtonType("Add bill",ButtonBar.ButtonData.OK_DONE);d.getDialogPane().getButtonTypes().addAll(ButtonType.CANCEL,save);TextField name=new TextField();TextField category=new TextField("Utilities");TextField amount=new TextField();DatePicker due=new DatePicker(LocalDate.now().plusDays(7));CheckBox recurring=new CheckBox("Recurring payment");CheckBox subscription=new CheckBox("This is a subscription");ComboBox<String> frequency=new ComboBox<>(FXCollections.observableArrayList("MONTHLY","QUARTERLY","ANNUAL"));frequency.getSelectionModel().selectFirst();d.getDialogPane().setContent(new VBox(10,Ui.label("NEW OBLIGATION","eyebrow"),Ui.label("Add bill or subscription","dialog-title"),field("NAME",name),Ui.row(field("CATEGORY",category),field("AMOUNT",amount)),Ui.row(field("DUE DATE",due),field("FREQUENCY",frequency)),recurring,subscription));d.getDialogPane().lookupButton(save).addEventFilter(javafx.event.ActionEvent.ACTION,e->{try{Bill bill=new Bill(0,name.getText(),category.getText(),new BigDecimal(amount.getText().replace(",","")),due.getValue(),recurring.isSelected(),frequency.getValue(),false,subscription.isSelected(),null,Instant.now(),Instant.now());ctx.controller().execute(()->ctx.controller().finance().addBill(bill),()->{ctx.toast().accept("Bill added to calendar");ctx.refresh().run();},ctx.error());}catch(Exception ex){e.consume();new Alert(Alert.AlertType.WARNING,ex.getMessage(),ButtonType.OK).showAndWait();}});d.showAndWait();}
    private static VBox field(String label,Control input){input.setMaxWidth(Double.MAX_VALUE);VBox b=new VBox(7,Ui.label(label,"field-label"),input);HBox.setHgrow(b,Priority.ALWAYS);return b;}
}
