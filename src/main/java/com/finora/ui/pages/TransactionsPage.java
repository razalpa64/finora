package com.finora.ui.pages;

import com.finora.brain.FinoraBrain;
import com.finora.model.Account;
import com.finora.model.TransactionRecord;
import com.finora.ui.Icons;
import com.finora.ui.PageContext;
import com.finora.ui.Ui;
import com.finora.util.Money;
import javafx.beans.property.ReadOnlyStringWrapper;
import javafx.collections.FXCollections;
import javafx.collections.transformation.FilteredList;
import javafx.geometry.Pos;
import javafx.scene.Node;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.stage.Window;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.stream.Collectors;

public final class TransactionsPage {
    private TransactionsPage(){}
    public static Node build(FinoraBrain.BrainState state,PageContext context){
        VBox content=new VBox(22);content.getStyleClass().add("page-content");
        Button add=Ui.button("Add transaction","primary-button");add.setGraphic(Icons.create("plus",16));add.setOnAction(e->showAddDialog(state,context));
        if(state.snapshot().accounts().isEmpty()){add.setDisable(true);add.setText("Account required");add.setTooltip(new Tooltip("Add an account in Settings before recording transactions."));}
        HBox header=Ui.row(Ui.sectionTitle("MONEY MOVEMENT","Transactions","Every recorded inflow, outflow and allocation — without double-counting transfers."),Ui.spacer(),add);content.getChildren().add(header);
        BigDecimal income=state.snapshot().recordedIncome(),expense=state.snapshot().monthlyExpenses(),net=income.subtract(state.snapshot().monthlyOutflow());
        GridPane summary=new GridPane();summary.setHgap(14);Ui.gridColumns(summary,33.3,33.3,33.4);summary.add(summaryCard("INFLOW",Money.inr(income),"This month","positive"),0,0);summary.add(summaryCard("OUTFLOW",Money.inr(state.snapshot().monthlyOutflow()),"Expense + debt","negative"),1,0);summary.add(summaryCard("NET MOVEMENT",Money.inr(net),"Recorded this month",net.signum()>=0?"positive":"negative"),2,0);content.getChildren().add(summary);
        Map<Long,String> accountNames=state.snapshot().accounts().stream().collect(Collectors.toMap(Account::id,Account::name));
        var base=FXCollections.observableArrayList(state.snapshot().transactions());FilteredList<TransactionRecord> filtered=new FilteredList<>(base,t->true);
        TextField search=new TextField();search.setPromptText("Search description or category");search.getStyleClass().add("search-field");HBox.setHgrow(search,Priority.ALWAYS);
        ComboBox<String> type=new ComboBox<>(FXCollections.observableArrayList("All types","Income","Expenses","Debt / EMI","Goals / Investments"));type.getSelectionModel().selectFirst();
        Runnable apply=()->{String q=search.getText().toLowerCase();String selected=type.getValue();filtered.setPredicate(t->{boolean text=q.isBlank()||t.description().toLowerCase().contains(q)||t.category().toLowerCase().contains(q);boolean kind=switch(selected){case "Income"->t.type()==TransactionRecord.TransactionType.INCOME;case "Expenses"->t.type()==TransactionRecord.TransactionType.EXPENSE;case "Debt / EMI"->t.type()==TransactionRecord.TransactionType.DEBT_PAYMENT||t.type()==TransactionRecord.TransactionType.EMI_PAYMENT;case "Goals / Investments"->t.type()==TransactionRecord.TransactionType.GOAL_CONTRIBUTION||t.type()==TransactionRecord.TransactionType.INVESTMENT_CONTRIBUTION;default->true;};return text&&kind;});};
        search.textProperty().addListener((o,a,b)->apply.run());type.valueProperty().addListener((o,a,b)->apply.run());
        HBox tools=Ui.row(Icons.create("search",17),search,type,Ui.label(filtered.size()+" records","muted"));tools.getStyleClass().add("table-tools");
        TableView<TransactionRecord> table=new TableView<>(filtered);table.getStyleClass().add("finance-table");table.setColumnResizePolicy(TableView.CONSTRAINED_RESIZE_POLICY_FLEX_LAST_COLUMN);table.setPlaceholder(Ui.label("No transactions match this view.","empty-copy"));
        TableColumn<TransactionRecord,String> date=new TableColumn<>("DATE");date.setCellValueFactory(v->new ReadOnlyStringWrapper(v.getValue().date().format(DateTimeFormatter.ofPattern("dd MMM"))));date.setPrefWidth(90);
        TableColumn<TransactionRecord,String> desc=new TableColumn<>("DESCRIPTION");desc.setCellValueFactory(v->new ReadOnlyStringWrapper(v.getValue().description()));desc.setPrefWidth(280);
        TableColumn<TransactionRecord,String> cat=new TableColumn<>("CATEGORY");cat.setCellValueFactory(v->new ReadOnlyStringWrapper(v.getValue().category()));
        TableColumn<TransactionRecord,String> acc=new TableColumn<>("ACCOUNT");acc.setCellValueFactory(v->new ReadOnlyStringWrapper(accountNames.getOrDefault(v.getValue().accountId(),"Account")));
        TableColumn<TransactionRecord,String> txType=new TableColumn<>("TYPE");txType.setCellValueFactory(v->new ReadOnlyStringWrapper(v.getValue().type().name().replace('_',' ')));
        TableColumn<TransactionRecord,String> amount=new TableColumn<>("AMOUNT");amount.setCellValueFactory(v->{boolean plus=v.getValue().type()==TransactionRecord.TransactionType.INCOME;return new ReadOnlyStringWrapper((plus?"+ ":"− ")+Money.inr(v.getValue().amount()));});amount.setCellFactory(c->new TableCell<>(){@Override protected void updateItem(String item,boolean empty){super.updateItem(item,empty);setText(empty?null:item);getStyleClass().removeAll("amount-positive","amount-negative");if(!empty)getStyleClass().add(item.startsWith("+")?"amount-positive":"amount-negative");}});amount.setStyle("-fx-alignment: CENTER-RIGHT;");
        table.getColumns().addAll(date,desc,cat,acc,txType,amount);table.setFixedCellSize(58);table.setPrefHeight(Math.max(360,Math.min(620,base.size()*58+42)));
        VBox tableCard=Ui.card(tools,table);tableCard.setSpacing(0);content.getChildren().add(tableCard);return Ui.scroll(content);
    }
    private static VBox summaryCard(String title,String value,String sub,String tone){VBox box=Ui.card(Ui.label(title,"eyebrow"),Ui.label(value,"stat-value",tone),Ui.label(sub,"stat-detail"));box.getStyleClass().add("summary-card");return box;}
    public static void showAddDialog(FinoraBrain.BrainState state,PageContext context){
        Dialog<ButtonType> d=new Dialog<>();d.setTitle("Add transaction");d.initOwner(context.owner().get());d.getDialogPane().getStyleClass().add("finora-dialog");
        ButtonType save=new ButtonType("Save transaction",ButtonBar.ButtonData.OK_DONE);d.getDialogPane().getButtonTypes().addAll(ButtonType.CANCEL,save);
        TextField description=new TextField();description.setPromptText("e.g. Grocery shopping");TextField amount=new TextField();amount.setPromptText("0.00");
        ComboBox<TransactionRecord.TransactionType> type=new ComboBox<>(FXCollections.observableArrayList(TransactionRecord.TransactionType.INCOME,TransactionRecord.TransactionType.EXPENSE,TransactionRecord.TransactionType.TRANSFER,TransactionRecord.TransactionType.DEBT_PAYMENT,TransactionRecord.TransactionType.EMI_PAYMENT,TransactionRecord.TransactionType.GOAL_CONTRIBUTION,TransactionRecord.TransactionType.INVESTMENT_CONTRIBUTION));type.getSelectionModel().select(TransactionRecord.TransactionType.EXPENSE);
        TextField category=new TextField("Groceries");ComboBox<Account> account=new ComboBox<>(FXCollections.observableArrayList(state.snapshot().accounts()));account.setCellFactory(c->accountCell());account.setButtonCell(accountCell());if(!account.getItems().isEmpty())account.getSelectionModel().selectFirst();
        ComboBox<Account> destination=new ComboBox<>(FXCollections.observableArrayList(state.snapshot().accounts()));destination.setCellFactory(c->accountCell());destination.setButtonCell(accountCell());destination.setVisible(false);destination.setManaged(false);
        type.valueProperty().addListener((o,a,b)->{boolean transfer=b==TransactionRecord.TransactionType.TRANSFER;destination.setVisible(transfer);destination.setManaged(transfer);});
        DatePicker date=new DatePicker(LocalDate.now());TextArea notes=new TextArea();notes.setPromptText("Optional notes");notes.setPrefRowCount(2);
        GridPane form=form();addRow(form,0,"DESCRIPTION",description);addRow(form,1,"AMOUNT",amount);addRow(form,2,"TYPE",type);addRow(form,3,"CATEGORY",category);addRow(form,4,"ACCOUNT",account);addRow(form,5,"TO ACCOUNT",destination);addRow(form,6,"DATE",date);addRow(form,7,"NOTES",notes);d.getDialogPane().setContent(new VBox(8,Ui.label("RECORD MONEY MOVEMENT","eyebrow"),Ui.label("Add a transaction","dialog-title"),Ui.label("Balances and connected records update atomically.","muted"),form));
        Node saveButton=d.getDialogPane().lookupButton(save);saveButton.addEventFilter(javafx.event.ActionEvent.ACTION,e->{try{BigDecimal value=new BigDecimal(amount.getText().replace(",","").trim());if(description.getText().isBlank())throw new IllegalArgumentException("Description is required.");if(account.getValue()==null)throw new IllegalArgumentException("Select an account.");if(type.getValue()==TransactionRecord.TransactionType.TRANSFER&&destination.getValue()==null)throw new IllegalArgumentException("Select a destination account.");d.setResult(save);context.controller().execute(()->context.controller().finance().addTransaction(value,type.getValue(),category.getText(),account.getValue().id(),destination.getValue()==null?null:destination.getValue().id(),date.getValue(),description.getText(),notes.getText()),()->{d.close();context.toast().accept("Transaction added");context.refresh().run();},context.error());}catch(Exception ex){e.consume();showValidation(d.getOwner(),ex.getMessage());}});d.showAndWait();
    }
    private static ListCell<Account> accountCell(){return new ListCell<>(){@Override protected void updateItem(Account item,boolean empty){super.updateItem(item,empty);setText(empty||item==null?null:item.name()+"  ·  "+Money.inr(item.balance()));}};}
    private static GridPane form(){GridPane g=new GridPane();g.setHgap(16);g.setVgap(12);ColumnConstraints a=new ColumnConstraints(105);ColumnConstraints b=new ColumnConstraints();b.setHgrow(Priority.ALWAYS);g.getColumnConstraints().addAll(a,b);return g;}
    private static void addRow(GridPane g,int row,String label,Node input){Label l=Ui.label(label,"field-label");g.add(l,0,row);g.add(input,1,row);}
    private static void showValidation(Window owner,String message){Alert a=new Alert(Alert.AlertType.WARNING,message,ButtonType.OK);a.setHeaderText("Check this transaction");a.initOwner(owner);a.showAndWait();}
}
