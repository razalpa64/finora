package com.finora.ui;

import com.finora.controller.AppController;
import com.finora.model.UserProfile;
import com.finora.service.AuthService;
import javafx.animation.FadeTransition;
import javafx.application.Platform;
import javafx.geometry.Pos;
import javafx.scene.Node;
import javafx.scene.control.*;
import javafx.scene.input.KeyCode;
import javafx.scene.layout.*;
import javafx.util.Duration;

import java.util.Arrays;
import java.util.function.Consumer;

public final class LoginView {
    private final AppController controller;
    private final Consumer<UserProfile> authenticated;
    private final Consumer<Throwable> externalError;
    private final StackPane root = new StackPane();
    private final VBox formHost = new VBox();
    private VBox brandPanel;
    private VBox formPanel;
    private final Label formEyebrow = Ui.label("LOCAL SIGN IN", "eyebrow");
    private final Label formTitle = Ui.label("Welcome back", "login-title");
    private final Label formCopy = Ui.label("Sign in to open your private financial workspace.", "login-copy");
    private final TextField displayName = new TextField();
    private final TextField username = new TextField();
    private final PasswordField password = new PasswordField();
    private final PasswordField confirmation = new PasswordField();
    private final CheckBox rememberMe = new CheckBox("Keep me signed in on this device");
    private final Label error = Ui.label("", "login-error");
    private final Button submit = Ui.button("Sign in", "login-primary");
    private final ToggleButton signInTab = new ToggleButton("Sign in");
    private final ToggleButton createAccountTab = new ToggleButton("Create account");
    private final ToggleGroup authMode = new ToggleGroup();
    private final ProgressIndicator busy = new ProgressIndicator();
    private final boolean usersExist;
    private boolean createMode;

    public LoginView(AppController controller, boolean usersExist,
                     Consumer<UserProfile> authenticated, Consumer<Throwable> externalError) {
        this.controller = controller;
        this.usersExist = usersExist;
        this.authenticated = authenticated;
        this.externalError = externalError;
        this.createMode = !usersExist;
        build();
        renderMode();
    }

    public StackPane root() {
        return root;
    }

    private void build() {
        root.getStyleClass().addAll("auth-root", "light-theme");
        HBox layout = new HBox();
        layout.getStyleClass().add("auth-layout");
        brandPanel = brandPanel();
        StackPane formWrapper = new StackPane(formHost);
        formWrapper.setAlignment(Pos.CENTER);
        ScrollPane formScroll = new ScrollPane(formWrapper);
        formScroll.setFitToWidth(true);
        formScroll.setHbarPolicy(ScrollPane.ScrollBarPolicy.NEVER);
        formScroll.getStyleClass().add("auth-form-scroll");
        formPanel = new VBox(formScroll);
        VBox.setVgrow(formScroll, Priority.ALWAYS);
        formPanel.setAlignment(Pos.CENTER);
        formPanel.getStyleClass().add("auth-form-panel");
        HBox.setHgrow(formPanel, Priority.ALWAYS);
        layout.getChildren().addAll(brandPanel, formPanel);
        root.getChildren().add(layout);
        root.widthProperty().addListener((observable, oldWidth, newWidth) -> {
            boolean showBrand = newWidth.doubleValue() >= 960;
            brandPanel.setVisible(showBrand);
            brandPanel.setManaged(showBrand);
        });

        formCopy.setWrapText(true);
        displayName.setPromptText("Your name");
        username.setPromptText("Username");
        password.setPromptText("Password");
        confirmation.setPromptText("Confirm password");
        rememberMe.setSelected(true);
        rememberMe.getStyleClass().add("remember-check");
        displayName.getStyleClass().add("auth-input");
        username.getStyleClass().add("auth-input");
        password.getStyleClass().add("auth-input");
        confirmation.getStyleClass().add("auth-input");
        error.setWrapText(true);
        error.setVisible(false);
        error.setManaged(false);
        busy.setMaxSize(19, 19);
        busy.setVisible(false);
        busy.setManaged(false);
        submit.setMaxWidth(Double.MAX_VALUE);
        submit.setOnAction(event -> submit());
        signInTab.setToggleGroup(authMode);
        createAccountTab.setToggleGroup(authMode);
        signInTab.setMaxWidth(Double.MAX_VALUE);
        createAccountTab.setMaxWidth(Double.MAX_VALUE);
        signInTab.getStyleClass().add("auth-mode-tab");
        createAccountTab.getStyleClass().add("auth-mode-tab");
        signInTab.setOnAction(event -> selectMode(false));
        createAccountTab.setOnAction(event -> selectMode(true));
        root.setOnKeyPressed(event -> {
            if (event.getCode() == KeyCode.ENTER && !submit.isDisabled()) submit();
        });
    }

    private VBox brandPanel() {
        StackPane mark = new StackPane(Ui.label("F", "auth-mark-letter"));
        mark.getStyleClass().add("auth-mark");
        Label name = Ui.label("FINORA", "auth-brand-name");
        Label tagline = Ui.label("Know what needs to happen next.", "auth-tagline");
        tagline.setWrapText(true);
        Label copy = Ui.label("A private financial command center that calculates from your records — fully offline by default.", "auth-brand-copy");
        copy.setWrapText(true);
        VBox features = new VBox(14,
                feature("LOCAL FIRST", "Embedded H2 storage on this device"),
                feature("EXPLAINABLE", "Facts, recommendations and assumptions stay distinct"),
                feature("PRIVATE", "No online AI service is required"));
        VBox panel = new VBox(18, Ui.row(mark, name), tagline, copy, features);
        panel.setAlignment(Pos.CENTER_LEFT);
        panel.getStyleClass().add("auth-brand-panel");
        panel.setPrefWidth(470);
        panel.setMinWidth(390);
        return panel;
    }

    private HBox feature(String title, String copy) {
        StackPane check = new StackPane(Ui.label("✓", "auth-check-text"));
        check.getStyleClass().add("auth-check");
        Label body = Ui.label(copy, "auth-feature-copy");
        body.setWrapText(true);
        return Ui.row(check, new VBox(3, Ui.label(title, "auth-feature-title"), body));
    }

    private void selectMode(boolean create) {
        if (createMode == create) {
            (create ? createAccountTab : signInTab).setSelected(true);
            return;
        }
        createMode = create;
        clearSensitiveFields();
        renderMode();
    }

    private HBox modeSelector() {
        signInTab.setSelected(!createMode);
        createAccountTab.setSelected(createMode);
        HBox row = new HBox(signInTab, createAccountTab);
        HBox.setHgrow(signInTab, Priority.ALWAYS);
        HBox.setHgrow(createAccountTab, Priority.ALWAYS);
        row.getStyleClass().add("auth-mode-selector");
        return row;
    }

    private void renderMode() {
        formHost.getChildren().clear();
        formHost.getStyleClass().setAll("auth-form-card");
        formHost.setMaxWidth(430);
        formHost.setSpacing(14);
        error.setText("");
        error.setVisible(false);
        error.setManaged(false);
        HBox selector = modeSelector();

        if (createMode) {
            formEyebrow.setText("PRIVATE LOCAL PROFILE");
            formTitle.setText("Create your workspace");
            formCopy.setText(usersExist
                    ? "Create a separate private workspace. Existing profiles and financial records remain isolated."
                    : "Set up a local sign-in. No sample transactions or invented balances will be added.");
            submit.setText("Create account & continue");
            formHost.getChildren().addAll(selector, formEyebrow, formTitle, formCopy,
                    field("DISPLAY NAME", displayName), field("USERNAME", username),
                    field("PASSWORD", password), field("CONFIRM PASSWORD", confirmation),
                    passwordRules(), rememberBlock(), error, actionRow(), localNotice());
            Platform.runLater(displayName::requestFocus);
        } else {
            formEyebrow.setText("LOCAL SIGN IN");
            formTitle.setText("Welcome back");
            formCopy.setText(usersExist
                    ? "Sign in to open your private financial workspace."
                    : "No profile exists yet. Choose Create account to make your first private workspace.");
            submit.setText("Sign in securely");
            formHost.getChildren().addAll(selector, formEyebrow, formTitle, formCopy,
                    field("USERNAME", username), field("PASSWORD", password),
                    rememberBlock(), error, actionRow(), localNotice());
            Platform.runLater(username::requestFocus);
        }
        FadeTransition fade = new FadeTransition(Duration.millis(180), formHost);
        fade.setFromValue(.25);
        fade.setToValue(1);
        fade.play();
    }

    private VBox field(String label, Control input) {
        input.setMaxWidth(Double.MAX_VALUE);
        return new VBox(7, Ui.label(label, "field-label"), input);
    }

    private Label passwordRules() {
        Label rules = Ui.label("Use 8–128 characters with at least one letter and one number.", "auth-help");
        rules.setWrapText(true);
        return rules;
    }

    private VBox rememberBlock() {
        Label detail = Ui.label("Uses a revocable 30-day device token. Your password is never saved.", "remember-detail");
        detail.setWrapText(true);
        VBox box = new VBox(4, rememberMe, detail);
        box.getStyleClass().add("remember-block");
        return box;
    }

    private HBox actionRow() {
        HBox row = Ui.row(submit, busy);
        HBox.setHgrow(submit, Priority.ALWAYS);
        return row;
    }

    private HBox localNotice() {
        Label text = Ui.label("Credentials are verified locally using PBKDF2-HMAC-SHA256. Your password is never stored.", "auth-local-copy");
        text.setWrapText(true);
        return Ui.row(Ui.severityDot("healthy"), text);
    }

    private void submit() {
        hideError();
        String user = username.getText();
        char[] secret = password.getText().toCharArray();
        setBusy(true);
        if (createMode) {
            char[] repeated = confirmation.getText().toCharArray();
            if (!Arrays.equals(secret, repeated)) {
                Arrays.fill(secret, '\0');
                Arrays.fill(repeated, '\0');
                setBusy(false);
                showInlineError("Passwords do not match.");
                return;
            }
            Arrays.fill(repeated, '\0');
            controller.register(displayName.getText(), user, secret, rememberMe.isSelected(), profile -> {
                setBusy(false);
                clearSensitiveFields();
                authenticated.accept(profile);
            }, this::handleError);
        } else {
            controller.signIn(user, secret, rememberMe.isSelected(), profile -> {
                setBusy(false);
                clearSensitiveFields();
                authenticated.accept(profile);
            }, this::handleError);
        }
    }

    private void handleError(Throwable throwable) {
        setBusy(false);
        Throwable cause = throwable;
        while (cause.getCause() != null) cause = cause.getCause();
        if (cause instanceof IllegalArgumentException || cause instanceof IllegalStateException || cause instanceof AuthService.AuthenticationException) {
            showInlineError(cause.getMessage());
        } else {
            externalError.accept(cause);
        }
    }

    private void setBusy(boolean value) {
        submit.setDisable(value);
        signInTab.setDisable(value);
        createAccountTab.setDisable(value);
        busy.setVisible(value);
        busy.setManaged(value);
    }

    private void hideError() {
        error.setVisible(false);
        error.setManaged(false);
        error.setText("");
    }

    private void showInlineError(String message) {
        error.setText(message == null ? "Sign in could not be completed." : message);
        error.setVisible(true);
        error.setManaged(true);
    }

    private void clearSensitiveFields() {
        password.clear();
        confirmation.clear();
    }
}
