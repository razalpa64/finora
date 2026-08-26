package com.finora.ui.pages;

import com.finora.brain.FinoraBrain;
import com.finora.model.Account;
import com.finora.model.IncomeSource;
import com.finora.ui.Icons;
import com.finora.ui.PageContext;
import com.finora.ui.Ui;
import com.finora.util.Money;
import javafx.collections.FXCollections;
import javafx.geometry.Pos;
import javafx.scene.Node;
import javafx.scene.control.*;
import javafx.scene.layout.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Comparator;
import java.util.Map;
import java.util.stream.Collectors;

public final class IncomePage {
    private IncomePage() {
    }

    public static Node build(FinoraBrain.BrainState state, PageContext context, Runnable openSettings) {
        VBox content = new VBox(22);
        content.getStyleClass().add("page-content");
        Button add = Ui.button("Add monthly income", "primary-button");
        add.setGraphic(Icons.create("plus", 16));
        add.setOnAction(event -> showAddDialog(state, context));
        if (state.snapshot().accounts().isEmpty()) {
            add.setText("Add an account first");
            add.setOnAction(event -> openSettings.run());
        }
        content.getChildren().add(Ui.row(
                Ui.sectionTitle("INCOME FOUNDATION", "Income Center",
                        "Add recurring income, record each receipt and keep plans separate from money actually received."),
                Ui.spacer(), add));

        BigDecimal expected = state.snapshot().expectedRecurringIncome();
        BigDecimal recorded = state.snapshot().recordedIncome();
        IncomeSource next = state.snapshot().incomeSources().stream()
                .min(Comparator.comparing(IncomeSource::nextIncomeDate)).orElse(null);
        GridPane summary = new GridPane();
        summary.setHgap(14);
        Ui.gridColumns(summary, 33, 33, 34);
        summary.add(stat("EXPECTED MONTHLY", Money.inr(expected),
                state.snapshot().incomeSources().size() + " active source" +
                        (state.snapshot().incomeSources().size() == 1 ? "" : "s"), "positive"), 0, 0);
        summary.add(stat("RECEIVED THIS MONTH", Money.inr(recorded),
                "Recorded transactions only", "neutral"), 1, 0);
        summary.add(stat("NEXT EXPECTED", next == null ? "Not scheduled" : Money.inr(next.amount()),
                next == null ? "Add a recurring source" : next.nextIncomeDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy")),
                "positive"), 2, 0);
        content.getChildren().add(summary);

        if (state.snapshot().accounts().isEmpty()) {
            content.getChildren().add(accountRequired(openSettings));
        } else if (state.snapshot().incomeSources().isEmpty()) {
            content.getChildren().add(emptyState(() -> showAddDialog(state, context)));
        } else {
            content.getChildren().add(sourceList(state, context));
        }
        content.getChildren().add(explanation());
        return Ui.scroll(content);
    }

    private static VBox sourceList(FinoraBrain.BrainState state, PageContext context) {
        Map<Long, String> accounts = state.snapshot().accounts().stream()
                .collect(Collectors.toMap(Account::id, Account::name));
        VBox rows = new VBox(10);
        for (IncomeSource source : state.snapshot().incomeSources()) {
            long days = ChronoUnit.DAYS.between(LocalDate.now(), source.nextIncomeDate());
            String timing = days < 0 ? Math.abs(days) + " days overdue"
                    : days == 0 ? "Expected today" : "Expected in " + days + " days";
            StackPane icon = new StackPane(Icons.create("income", 18));
            icon.getStyleClass().add("income-source-icon");
            VBox identity = new VBox(4,
                    Ui.label(source.name(), "debt-name"),
                    Ui.label(source.frequency().label() + " · to " +
                            accounts.getOrDefault(source.accountId(), "Account"), "muted"));
            HBox.setHgrow(identity, Priority.ALWAYS);
            VBox schedule = new VBox(3,
                    Ui.label(source.nextIncomeDate().format(DateTimeFormatter.ofPattern("dd MMM yyyy")), "priority-title"),
                    Ui.label(timing, days < 0 ? "due-warning" : "micro-copy"));
            schedule.setAlignment(Pos.CENTER_RIGHT);
            VBox amount = new VBox(3,
                    Ui.label(Money.inr(source.amount()), "debt-amount"),
                    Ui.label(Money.inr(source.monthlyEquivalent()) + " monthly equivalent", "micro-copy"));
            amount.setAlignment(Pos.CENTER_RIGHT);
            Button receive = Ui.button("Record received", "secondary-button");
            receive.setOnAction(event -> recordIncome(source, context));
            Button remove = Ui.iconButton("plus", "Remove income source");
            remove.setRotate(45);
            remove.getStyleClass().add("danger-icon-button");
            remove.setOnAction(event -> removeSource(source, context));
            HBox row = Ui.row(icon, identity, schedule, amount, receive, remove);
            VBox card = Ui.card(row);
            card.getStyleClass().add("income-source-card");
            rows.getChildren().add(card);
        }
        return Ui.card(Ui.row(
                new VBox(4, Ui.label("ACTIVE INCOME", "eyebrow"), Ui.label("Recurring income schedule", "section-title")),
                Ui.spacer(), Ui.label(state.snapshot().incomeSources().size() + " SOURCES", "soft-chip")), rows);
    }

    private static VBox emptyState(Runnable addIncome) {
        Button button = Ui.button("Add monthly income", "primary-button");
        button.setGraphic(Icons.create("plus", 16));
        button.setOnAction(event -> addIncome.run());
        Label copy = Ui.label("No income assumptions are active. Add salary, freelance income, pension or another recurring source.", "body-copy");
        copy.setWrapText(true);
        VBox card = Ui.card(Icons.create("income", 30), Ui.label("No recurring income yet", "section-title"), copy, button);
        card.setAlignment(Pos.CENTER);
        card.getStyleClass().add("empty-state-card");
        return card;
    }

    private static VBox accountRequired(Runnable openSettings) {
        Button button = Ui.button("Create an account", "primary-button");
        button.setOnAction(event -> openSettings.run());
        Label copy = Ui.label("Income must be deposited into an account so FINORA can update cash and net worth correctly.", "body-copy");
        copy.setWrapText(true);
        VBox card = Ui.card(Ui.label("ACCOUNT REQUIRED", "eyebrow"),
                Ui.label("Add where your income is received", "section-title"), copy, button);
        card.getStyleClass().add("assumption-card");
        return card;
    }

    private static VBox explanation() {
        Label text = Ui.label("EXPECTED MONTHLY is a planning fact derived from active recurring sources. RECEIVED THIS MONTH only includes recorded income transactions. Forecasts use scheduled dates; FINORA does not assume that unscheduled income will repeat.", "body-copy");
        text.setWrapText(true);
        return Ui.card(Ui.label("HOW FINORA USES INCOME", "assumption-label"), text);
    }

    private static VBox stat(String title, String value, String sub, String tone) {
        VBox card = Ui.card(Ui.label(title, "eyebrow"), Ui.label(value, "stat-value", tone), Ui.label(sub, "stat-detail"));
        card.getStyleClass().add("summary-card");
        return card;
    }

    private static void showAddDialog(FinoraBrain.BrainState state, PageContext context) {
        if (state.snapshot().accounts().isEmpty()) return;
        Dialog<ButtonType> dialog = new Dialog<>();
        dialog.setTitle("Add recurring income");
        dialog.initOwner(context.owner().get());
        ButtonType save = new ButtonType("Add income", ButtonBar.ButtonData.OK_DONE);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.CANCEL, save);

        TextField name = new TextField();
        name.setPromptText("Salary, freelance work, pension…");
        TextField amount = new TextField();
        amount.setPromptText("Monthly amount");
        ComboBox<IncomeSource.Frequency> frequency = new ComboBox<>(
                FXCollections.observableArrayList(IncomeSource.Frequency.values()));
        frequency.setCellFactory(cell -> frequencyCell());
        frequency.setButtonCell(frequencyCell());
        frequency.getSelectionModel().select(IncomeSource.Frequency.MONTHLY);
        DatePicker nextDate = new DatePicker();
        nextDate.setPromptText("Next expected date");
        ComboBox<Account> account = accountBox(state);
        TextArea notes = new TextArea();
        notes.setPromptText("Optional notes");
        notes.setPrefRowCount(2);
        CheckBox recordNow = new CheckBox("Also record this income as received today");

        VBox form = new VBox(11,
                field("INCOME SOURCE", name),
                Ui.row(field("AMOUNT PER PAYMENT", amount), field("FREQUENCY", frequency)),
                Ui.row(field("NEXT EXPECTED DATE", nextDate), field("DEPOSIT ACCOUNT", account)),
                field("NOTES", notes), recordNow);
        dialog.getDialogPane().setContent(new VBox(10,
                Ui.label("RECURRING INCOME", "eyebrow"), Ui.label("Add an income source", "dialog-title"),
                Ui.label("This creates a schedule. Money is added to your balance only when it is recorded as received.", "muted"), form));

        Node saveButton = dialog.getDialogPane().lookupButton(save);
        saveButton.addEventFilter(javafx.event.ActionEvent.ACTION, event -> {
            event.consume();
            try {
                BigDecimal value = new BigDecimal(amount.getText().replace(",", "").trim());
                if (nextDate.getValue() == null) throw new IllegalArgumentException("Select the next expected income date.");
                saveButton.setDisable(true);
                context.controller().execute(
                        () -> context.controller().finance().addIncomeSource(name.getText(), value,
                                frequency.getValue(), nextDate.getValue(), account.getValue().id(),
                                notes.getText(), recordNow.isSelected()),
                        () -> {
                            dialog.close();
                            context.toast().accept(recordNow.isSelected() ? "Income source added and receipt recorded" : "Monthly income added");
                            context.refresh().run();
                        }, throwable -> {
                            saveButton.setDisable(false);
                            context.error().accept(throwable);
                        });
            } catch (Exception exception) {
                new Alert(Alert.AlertType.WARNING, exception.getMessage(), ButtonType.OK).showAndWait();
            }
        });
        dialog.showAndWait();
    }

    private static void recordIncome(IncomeSource source, PageContext context) {
        Dialog<ButtonType> dialog = new Dialog<>();
        dialog.setTitle("Record income received");
        dialog.initOwner(context.owner().get());
        ButtonType record = new ButtonType("Record received", ButtonBar.ButtonData.OK_DONE);
        dialog.getDialogPane().getButtonTypes().addAll(ButtonType.CANCEL, record);
        DatePicker date = new DatePicker(LocalDate.now());
        dialog.getDialogPane().setContent(new VBox(11,
                Ui.label("CALCULATED FACT", "eyebrow"), Ui.label(source.name(), "dialog-title"),
                Ui.label("Amount: " + Money.inr(source.amount()), "stat-value"),
                field("DATE RECEIVED", date),
                Ui.label("Recording this will increase the linked account balance and advance the schedule atomically.", "body-copy")));
        Node recordButton = dialog.getDialogPane().lookupButton(record);
        recordButton.addEventFilter(javafx.event.ActionEvent.ACTION, event -> {
            event.consume();
            recordButton.setDisable(true);
            context.controller().execute(() -> context.controller().finance().recordIncome(source, date.getValue()),
                    () -> {
                        dialog.close();
                        context.toast().accept("Income recorded");
                        context.refresh().run();
                    }, throwable -> {
                        recordButton.setDisable(false);
                        context.error().accept(throwable);
                    });
        });
        dialog.showAndWait();
    }

    private static void removeSource(IncomeSource source, PageContext context) {
        Alert confirmation = new Alert(Alert.AlertType.CONFIRMATION,
                "Past income transactions will remain. Only future scheduling is removed.", ButtonType.CANCEL, ButtonType.OK);
        confirmation.setTitle("Remove income source");
        confirmation.setHeaderText("Remove “" + source.name() + "”?");
        confirmation.initOwner(context.owner().get());
        confirmation.showAndWait().filter(button -> button == ButtonType.OK).ifPresent(button ->
                context.controller().execute(() -> context.controller().finance().deleteIncomeSource(source.id()),
                        () -> {
                            context.toast().accept("Income source removed");
                            context.refresh().run();
                        }, context.error()));
    }

    private static VBox field(String label, Control input) {
        input.setMaxWidth(Double.MAX_VALUE);
        VBox box = new VBox(7, Ui.label(label, "field-label"), input);
        HBox.setHgrow(box, Priority.ALWAYS);
        return box;
    }

    private static ComboBox<Account> accountBox(FinoraBrain.BrainState state) {
        ComboBox<Account> box = new ComboBox<>(FXCollections.observableArrayList(state.snapshot().accounts()));
        box.setCellFactory(cell -> accountCell());
        box.setButtonCell(accountCell());
        box.getSelectionModel().selectFirst();
        return box;
    }

    private static ListCell<Account> accountCell() {
        return new ListCell<>() {
            @Override protected void updateItem(Account account, boolean empty) {
                super.updateItem(account, empty);
                setText(empty || account == null ? null : account.name() + " · " + Money.inr(account.balance()));
            }
        };
    }

    private static ListCell<IncomeSource.Frequency> frequencyCell() {
        return new ListCell<>() {
            @Override protected void updateItem(IncomeSource.Frequency frequency, boolean empty) {
                super.updateItem(frequency, empty);
                setText(empty || frequency == null ? null : frequency.label());
            }
        };
    }
}
