package com.finora.ui;

import com.finora.brain.FinoraBrain;
import com.finora.controller.AppController;
import com.finora.model.UserProfile;
import com.finora.ui.pages.*;
import javafx.animation.*;
import javafx.geometry.Insets;
import javafx.geometry.Pos;
import javafx.scene.Node;
import javafx.scene.control.*;
import javafx.scene.layout.*;
import javafx.stage.Window;
import javafx.util.Duration;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.EnumMap;
import java.util.Map;

public final class MainView {
    private enum Page { OVERVIEW, INCOME, TRANSACTIONS, PLAN, DEBT, GOALS, CALENDAR, REPORTS, BRAIN, SETTINGS }

    private final AppController controller;
    private final UserProfile user;
    private final Runnable signOut;
    private final Runnable toggleFullScreen;
    private final StackPane root = new StackPane();
    private final BorderPane shell = new BorderPane();
    private final StackPane contentHost = new StackPane();
    private final Label toast = new Label();
    private final ProgressIndicator loading = new ProgressIndicator();
    private final ToggleGroup navGroup = new ToggleGroup();
    private final Map<Page, ToggleButton> navButtons = new EnumMap<>(Page.class);
    private final VBox sidebar = new VBox();
    private final VBox logoText = new VBox();
    private final VBox profileText = new VBox();
    private final Label navLabel = Ui.label("COMMAND CENTER", "nav-section");
    private final Label intelligenceLabel = Ui.label("INTELLIGENCE", "nav-section");
    private TextField globalSearch;
    private Label topDate;
    private Label topTitle;
    private Label profileMore;
    private Button quickAdd;
    private Button logoutButton;
    private String pendingBrainQuestion;
    private FinoraBrain.BrainState state;
    private Page page = Page.OVERVIEW;
    private boolean dark;
    private boolean compact;

    public MainView(AppController controller, FinoraBrain.BrainState initial, UserProfile user,
                    Runnable signOut, Runnable toggleFullScreen) {
        this.controller = controller;
        this.state = initial;
        this.user = user;
        this.signOut = signOut;
        this.toggleFullScreen = toggleFullScreen;
        build();
        show(Page.OVERVIEW);
    }

    public StackPane root() { return root; }

    private void build() {
        root.getStyleClass().addAll("app-root", "light-theme");
        shell.getStyleClass().add("shell");
        shell.setLeft(buildSidebar());
        contentHost.getStyleClass().add("content-host");
        VBox mainColumn = new VBox(topbar(), contentHost);
        mainColumn.getStyleClass().add("main-column");
        VBox.setVgrow(contentHost, Priority.ALWAYS);
        shell.setCenter(mainColumn);
        root.getChildren().add(shell);

        toast.getStyleClass().add("toast");
        toast.setOpacity(0);
        toast.setMouseTransparent(true);
        StackPane.setAlignment(toast, Pos.BOTTOM_CENTER);
        StackPane.setMargin(toast, new Insets(0, 0, 28, 0));
        root.getChildren().add(toast);

        loading.setMaxSize(42, 42);
        loading.getStyleClass().add("loading-indicator");
        loading.setVisible(false);
        StackPane.setAlignment(loading, Pos.CENTER);
        root.getChildren().add(loading);

        root.sceneProperty().addListener((observable, oldScene, newScene) -> {
            if (newScene != null) {
                updateResponsiveMode(newScene.getWidth(), newScene.getHeight());
                newScene.widthProperty().addListener((obs, oldWidth, newWidth) ->
                        updateResponsiveMode(newWidth.doubleValue(), newScene.getHeight()));
                newScene.heightProperty().addListener((obs, oldHeight, newHeight) ->
                        updateResponsiveMode(newScene.getWidth(), newHeight.doubleValue()));
                newScene.addEventFilter(javafx.scene.input.KeyEvent.KEY_PRESSED, event -> {
                    if (event.getCode() == javafx.scene.input.KeyCode.F11) {
                        event.consume();
                        toggleFullScreen.run();
                    } else if (event.getCode() == javafx.scene.input.KeyCode.L && event.isControlDown() && event.isShiftDown()) {
                        event.consume();
                        confirmSignOut();
                    }
                });
            }
        });
    }

    private VBox buildSidebar() {
        sidebar.getStyleClass().add("sidebar");
        sidebar.setPrefWidth(236);
        sidebar.setMinWidth(236);
        StackPane mark = new StackPane(Ui.label("F", "logo-letter"));
        logoText.getChildren().setAll(Ui.label("FINORA", "logo-name"), Ui.label("FINANCIAL OS", "logo-sub"));
        logoText.setSpacing(1);
        HBox logo = Ui.row(mark, logoText);
        logo.getStyleClass().add("logo");

        VBox nav = new VBox(5);
        nav.getChildren().addAll(
                nav(Page.OVERVIEW, "overview", "Overview"),
                nav(Page.INCOME, "income", "Income"),
                nav(Page.TRANSACTIONS, "transactions", "Transactions"),
                nav(Page.PLAN, "plan", "Monthly plan"),
                nav(Page.DEBT, "debt", "Debt center"),
                nav(Page.GOALS, "goals", "Goals"),
                nav(Page.CALENDAR, "calendar", "Bills & calendar"),
                nav(Page.REPORTS, "reports", "Reports"));
        ToggleButton brain = nav(Page.BRAIN, "brain", "FINORA Brain");
        brain.getStyleClass().add("brain-nav");
        Region grow = new Region();
        VBox.setVgrow(grow, Priority.ALWAYS);
        ToggleButton settings = nav(Page.SETTINGS, "settings", "Settings");

        StackPane avatar = new StackPane(Ui.label(user.initials(), "avatar-text"));
        profileText.getChildren().setAll(Ui.label(user.displayName(), "profile-name"), Ui.label("@" + user.username(), "profile-sub"));
        profileText.setSpacing(2);
        profileMore = Ui.label("•••", "profile-more");
        HBox profile = Ui.row(avatar, profileText, Ui.spacer(), profileMore);
        profile.getStyleClass().add("profile-card");
        profile.setOnMouseClicked(event -> profileMenu(profile));
        profile.setCursor(javafx.scene.Cursor.HAND);

        sidebar.getChildren().addAll(logo, navLabel, nav, intelligenceLabel, brain, grow, settings, profile);
        return sidebar;
    }

    private ToggleButton nav(Page target, String icon, String title) {
        ToggleButton button = new ToggleButton(title);
        button.setUserData(title);
        button.setTooltip(new Tooltip(title));
        button.setGraphic(Icons.create(icon, 18));
        button.setToggleGroup(navGroup);
        button.setMaxWidth(Double.MAX_VALUE);
        button.setAlignment(Pos.CENTER_LEFT);
        button.getStyleClass().add("nav-button");
        button.setOnAction(event -> {
            if (!button.isSelected()) button.setSelected(true);
            show(target);
        });
        navButtons.put(target, button);
        return button;
    }

    private HBox topbar() {
        topTitle = Ui.label("Your Financial Command Center", "topbar-title");
        globalSearch = new TextField();
        globalSearch.setPromptText("Ask FINORA or find a record…");
        globalSearch.getStyleClass().add("global-search");
        globalSearch.setPrefWidth(315);
        globalSearch.setOnAction(event -> {
            String text = globalSearch.getText();
            if (text != null && !text.isBlank()) {
                pendingBrainQuestion = text.trim();
                globalSearch.clear();
                show(Page.BRAIN);
            }
        });
        Button fullScreen = Ui.iconButton("expand", "Toggle full screen");
        fullScreen.setTooltip(new Tooltip("Full screen · F11"));
        fullScreen.setOnAction(event -> toggleFullScreen.run());
        Button help = new Button("?");
        help.setAccessibleText("How FINORA works");
        help.setTooltip(new Tooltip("How FINORA works"));
        help.getStyleClass().addAll("icon-button", "help-button");
        help.setOnAction(event -> showHowItWorks());
        Button notification = Ui.iconButton("bell", "Notifications");
        notification.setOnAction(event -> showSignals(notification));
        quickAdd = Ui.button("Quick add", "top-add");
        quickAdd.setTooltip(new Tooltip("Add transaction"));
        quickAdd.setGraphic(Icons.create("plus", 16));
        quickAdd.setOnAction(event -> showQuickAdd(quickAdd));
        logoutButton = new Button("Log out");
        logoutButton.setGraphic(Icons.create("logout", 17));
        logoutButton.setTooltip(new Tooltip("Log out · Ctrl+Shift+L"));
        logoutButton.setAccessibleText("Log out of FINORA");
        logoutButton.getStyleClass().add("top-logout");
        logoutButton.setOnAction(event -> confirmSignOut());
        topDate = Ui.label(LocalDate.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy")), "top-date");
        HBox bar = Ui.row(topTitle, Ui.spacer(), globalSearch, topDate, fullScreen, help, notification, quickAdd, logoutButton);
        bar.getStyleClass().add("topbar");
        return bar;
    }

    private void show(Page next) {
        page = next;
        ToggleButton selected = navButtons.get(next);
        if (selected != null) selected.setSelected(true);
        Node view = switch (next) {
            case OVERVIEW -> DashboardPage.build(state, user.displayName(), () -> show(Page.BRAIN), () -> show(Page.SETTINGS), () -> show(Page.INCOME), () -> { show(Page.TRANSACTIONS); TransactionsPage.showAddDialog(state, context()); });
            case INCOME -> IncomePage.build(state, context(), () -> show(Page.SETTINGS));
            case TRANSACTIONS -> TransactionsPage.build(state, context());
            case PLAN -> PlanPage.build(state, () -> show(Page.INCOME));
            case DEBT -> DebtPage.build(state, context());
            case GOALS -> GoalsPage.build(state, context());
            case CALENDAR -> CalendarPage.build(state, context());
            case REPORTS -> ReportsPage.build(state);
            case BRAIN -> buildBrainPage();
            case SETTINGS -> SettingsPage.build(state, context(), this::toggleTheme, dark);
        };
        contentHost.getChildren().setAll(view);
        FadeTransition fade = new FadeTransition(Duration.millis(160), view);
        fade.setFromValue(.25);
        fade.setToValue(1);
        fade.play();
    }

    private Node buildBrainPage() {
        String question = pendingBrainQuestion;
        pendingBrainQuestion = null;
        return BrainPage.build(state, context(), question);
    }

    private PageContext context() {
        return new PageContext(controller, this::refresh, this::showToast, this::showError,
                () -> root.getScene() == null ? null : root.getScene().getWindow());
    }

    private void refresh() {
        loading.setVisible(true);
        shell.setDisable(true);
        controller.refresh(updated -> {
            state = updated;
            loading.setVisible(false);
            shell.setDisable(false);
            show(page);
        }, error -> {
            loading.setVisible(false);
            shell.setDisable(false);
            showError(error);
        });
    }

    private void toggleTheme() {
        dark = !dark;
        root.getStyleClass().removeAll("light-theme", "dark-theme");
        root.getStyleClass().add(dark ? "dark-theme" : "light-theme");
        show(page);
        showToast(dark ? "Dark theme enabled" : "Light theme enabled");
    }

    private void updateResponsiveMode(double width, double height) {
        // Compact before content becomes crowded. Height matters on 720p laptops because
        // navigation must remain reachable above the Windows taskbar.
        boolean nextCompact = width < 1240 || height < 700;
        if (nextCompact == compact) return;
        compact = nextCompact;
        sidebar.setPrefWidth(compact ? 78 : 236);
        sidebar.setMinWidth(compact ? 78 : 236);
        sidebar.getStyleClass().remove("sidebar-compact");
        if (compact) sidebar.getStyleClass().add("sidebar-compact");
        logoText.setVisible(!compact);
        logoText.setManaged(!compact);
        profileText.setVisible(!compact);
        profileText.setManaged(!compact);
        profileMore.setVisible(!compact);
        profileMore.setManaged(!compact);
        navLabel.setVisible(!compact);
        navLabel.setManaged(!compact);
        intelligenceLabel.setVisible(!compact);
        intelligenceLabel.setManaged(!compact);
        for (ToggleButton button : navButtons.values()) {
            button.setContentDisplay(compact ? ContentDisplay.GRAPHIC_ONLY : ContentDisplay.LEFT);
            button.setAlignment(compact ? Pos.CENTER : Pos.CENTER_LEFT);
        }
        topTitle.setVisible(!compact);
        topTitle.setManaged(!compact);
        topDate.setVisible(!compact);
        topDate.setManaged(!compact);
        quickAdd.setContentDisplay(compact ? ContentDisplay.GRAPHIC_ONLY : ContentDisplay.LEFT);
        logoutButton.setContentDisplay(compact ? ContentDisplay.GRAPHIC_ONLY : ContentDisplay.LEFT);
        logoutButton.setAlignment(compact ? Pos.CENTER : Pos.CENTER_LEFT);
        globalSearch.setPrefWidth(compact ? 240 : 315);
    }

    private void showHowItWorks() {
        Dialog<ButtonType> dialog = new Dialog<>();
        dialog.setTitle("How FINORA works");
        Window owner = root.getScene() == null ? null : root.getScene().getWindow();
        if (owner != null) dialog.initOwner(owner);
        dialog.getDialogPane().getButtonTypes().add(ButtonType.CLOSE);
        Label intro = Ui.label("FINORA follows the order below. Every dashboard value is recalculated from your local records.", "body-copy");
        intro.setWrapText(true);
        VBox steps = new VBox(0,
                helpStep("1", "Accounts", "Add where your cash, savings and investments are held."),
                helpStep("2", "Income", "Add recurring income, then record each payment when it is received."),
                helpStep("3", "Obligations", "Add spending, bills, debts and goals so FINORA can protect them."),
                helpStep("4", "Decisions", "Use Safe to Spend, Monthly Plan and FINORA Brain to understand the next action."));
        dialog.getDialogPane().setContent(new VBox(14, Ui.label("QUICK GUIDE", "eyebrow"),
                Ui.label("How to use FINORA OS", "dialog-title"), intro, steps,
                Ui.label("Expected values and recorded facts are shown separately throughout the application.", "assumption-label")));
        dialog.showAndWait();
    }

    private HBox helpStep(String number, String title, String copy) {
        StackPane badge = new StackPane(Ui.label(number, "setup-step-number"));
        badge.getStyleClass().addAll("setup-step-badge", "setup-step-open");
        Label detail = Ui.label(copy, "micro-copy");
        detail.setWrapText(true);
        VBox text = new VBox(4, Ui.label(title, "priority-title"), detail);
        HBox.setHgrow(text, Priority.ALWAYS);
        HBox row = Ui.row(badge, text);
        row.getStyleClass().add("setup-row");
        return row;
    }

    private void showQuickAdd(Node anchor) {
        ContextMenu menu = new ContextMenu();
        MenuItem income = new MenuItem("Monthly income source");
        income.setOnAction(event -> show(Page.INCOME));
        MenuItem transaction = new MenuItem("Transaction");
        transaction.setOnAction(event -> {
            if (state.snapshot().accounts().isEmpty()) {
                show(Page.SETTINGS);
                showToast("Create an account first");
            } else {
                TransactionsPage.showAddDialog(state, context());
            }
        });
        MenuItem account = new MenuItem("Account");
        account.setOnAction(event -> show(Page.SETTINGS));
        MenuItem debt = new MenuItem("Debt or loan");
        debt.setOnAction(event -> show(Page.DEBT));
        MenuItem goal = new MenuItem("Savings goal");
        goal.setOnAction(event -> show(Page.GOALS));
        MenuItem bill = new MenuItem("Bill or subscription");
        bill.setOnAction(event -> show(Page.CALENDAR));
        menu.getItems().addAll(income, transaction, account, new SeparatorMenuItem(), debt, goal, bill);
        menu.show(anchor, javafx.geometry.Side.BOTTOM, 0, 8);
    }

    private void showSignals(Node anchor) {
        if (state.recommendations().isEmpty()) {
            showToast("No active signals");
            return;
        }
        ContextMenu menu = new ContextMenu();
        for (var recommendation : state.recommendations()) {
            MenuItem item = new MenuItem(recommendation.title() + " — " + recommendation.message());
            item.setOnAction(event -> show(Page.OVERVIEW));
            menu.getItems().add(item);
        }
        menu.show(anchor, javafx.geometry.Side.BOTTOM, 0, 8);
    }

    private void profileMenu(Node anchor) {
        ContextMenu menu = new ContextMenu();
        MenuItem identity = new MenuItem(user.displayName() + "  ·  @" + user.username());
        identity.setDisable(true);
        MenuItem logout = new MenuItem("Log out");
        logout.setOnAction(event -> confirmSignOut());
        menu.getItems().addAll(identity, new SeparatorMenuItem(), logout);
        menu.show(anchor, javafx.geometry.Side.TOP, 0, -6);
    }

    private void confirmSignOut() {
        ButtonType confirm = new ButtonType("Log out", ButtonBar.ButtonData.OK_DONE);
        Alert alert = new Alert(Alert.AlertType.CONFIRMATION,
                "Your financial data will remain safely stored on this device. The remembered-device session will be revoked.",
                ButtonType.CANCEL, confirm);
        alert.setTitle("Log out");
        alert.setHeaderText("Log out of FINORA OS?");
        Window owner = root.getScene() == null ? null : root.getScene().getWindow();
        if (owner != null) alert.initOwner(owner);
        alert.showAndWait().filter(button -> button == confirm).ifPresent(button -> signOut.run());
    }

    private void showToast(String text) {
        toast.setText("✓  " + text);
        toast.setOpacity(0);
        FadeTransition in = new FadeTransition(Duration.millis(160), toast);
        in.setToValue(1);
        PauseTransition hold = new PauseTransition(Duration.seconds(2.6));
        FadeTransition out = new FadeTransition(Duration.millis(240), toast);
        out.setToValue(0);
        new SequentialTransition(in, hold, out).play();
    }

    private void showError(Throwable throwable) {
        Throwable cause = throwable;
        while (cause.getCause() != null) cause = cause.getCause();
        Alert alert = new Alert(Alert.AlertType.ERROR,
                cause.getMessage() == null ? cause.getClass().getSimpleName() : cause.getMessage(), ButtonType.OK);
        alert.setTitle("FINORA OS");
        alert.setHeaderText("This action could not be completed");
        Window owner = root.getScene() == null ? null : root.getScene().getWindow();
        if (owner != null) alert.initOwner(owner);
        alert.showAndWait();
    }
}
