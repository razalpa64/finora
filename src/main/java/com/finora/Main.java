package com.finora;

import com.finora.controller.AppController;
import com.finora.model.UserProfile;
import com.finora.ui.LoadingView;
import com.finora.ui.LoginView;
import com.finora.ui.MainView;
import com.finora.ui.WindowSizing;
import javafx.application.Application;
import javafx.application.Platform;
import javafx.geometry.Rectangle2D;
import javafx.scene.Scene;
import javafx.scene.control.Alert;
import javafx.scene.control.ButtonType;
import javafx.stage.Screen;
import javafx.stage.Stage;
import javafx.util.Duration;

import java.util.Comparator;

public final class Main extends Application {
    private static final double SCREEN_MARGIN = 28;
    private static final Duration MINIMUM_LOADING_TIME = Duration.seconds(2);
    private Stage stage;
    private Scene scene;
    private AppController controller;
    private LoadingView loading;
    private boolean workspaceMode;

    @Override
    public void start(Stage primaryStage) {
        stage = primaryStage;
        controller = new AppController();
        loading = new LoadingView();
        scene = new Scene(loading.root(), 1000, 650);
        scene.getStylesheets().add(getClass().getResource("/css/finora.css").toExternalForm());
        stage.setScene(scene);
        stage.setTitle("FINORA OS — Starting");
        stage.setResizable(true);
        stage.focusedProperty().addListener((observable, oldValue, focused) -> {
            if (focused && stage.isShowing()) Platform.runLater(this::clampExistingWindow);
        });
        fitAuthenticationWindow();
        stage.show();
        Platform.runLater(() -> {
            fitAuthenticationWindow();
            Platform.runLater(this::clampExistingWindow);
        });

        loading.update("Preparing local storage", .08, "No network connection is required", 1);
        controller.bootstrap(
                progress -> loading.update(progress.title(), progress.progress(), progress.detail(), progress.step()),
                result -> {
                    if (result.rememberedUser() != null) {
                        openWorkspace(result.rememberedUser());
                    } else {
                        loading.update("Ready for secure sign in", 1, "Your private local workspace is ready", 3);
                        loading.completeAfter(MINIMUM_LOADING_TIME, () -> showLogin(result.hasUsers()));
                    }
                },
                this::fatalStartupError);
    }

    private void showLogin(boolean usersExist) {
        workspaceMode = false;
        if (loading != null) loading.stop();
        LoginView login = new LoginView(controller, usersExist, this::openWorkspace, this::showError);
        scene.setRoot(login.root());
        stage.setTitle("FINORA OS — Local sign in");
        fitAuthenticationWindow();
        Platform.runLater(() -> {
            fitAuthenticationWindow();
            Platform.runLater(this::clampExistingWindow);
        });
    }

    private void openWorkspace(UserProfile profile) {
        boolean reuseVisibleLoader = loading != null && scene.getRoot() == loading.root();
        if (!reuseVisibleLoader) {
            if (loading != null) loading.stop();
            loading = new LoadingView();
            scene.setRoot(loading.root());
        }
        LoadingView activeLoader = loading;
        activeLoader.update("Opening financial workspace", .18, "Reading your private local records", 3);
        stage.setTitle("FINORA OS — Loading workspace");
        controller.loadWorkspace(
                progress -> activeLoader.update(progress.title(), progress.progress(), progress.detail(), progress.step()),
                state -> {
                    activeLoader.update("Workspace ready", 1, "All calculations completed locally", 3);
                    activeLoader.completeAfter(MINIMUM_LOADING_TIME, () -> {
                        if (loading != activeLoader) return;
                        MainView view = new MainView(controller, state, profile, this::signOut, this::toggleFullScreen);
                        scene.setRoot(view.root());
                        stage.setTitle("FINORA OS — Financial Command Center");
                        workspaceMode = true;
                        fitWorkspaceWindow();
                        Platform.runLater(() -> {
                            fitWorkspaceWindow();
                            Platform.runLater(this::clampExistingWindow);
                        });
                    });
                }, this::showErrorAndReturnToLogin);
    }

    private void signOut() {
        loading = new LoadingView();
        loading.update("Signing out", .42, "Revoking the remembered device session", 2);
        scene.setRoot(loading.root());
        LoadingView activeLoader = loading;
        controller.signOut(() -> {
            activeLoader.update("Signed out safely", 1, "The remembered-device session was revoked", 3);
            activeLoader.completeAfter(MINIMUM_LOADING_TIME, () -> showLogin(true));
        }, this::showErrorAndReturnToLogin);
    }

    private void fitAuthenticationWindow() {
        fitWindow(1040, 680, 720, 500);
    }

    private void fitWorkspaceWindow() {
        fitWindow(1280, 760, 760, 520);
    }

    /**
     * Clamps the complete decorated Stage to the current monitor's visual bounds.
     * Visual bounds already exclude the Windows taskbar, macOS menu bar and Linux panels.
     */
    private void fitWindow(double preferredWidth, double preferredHeight,
                           double designMinWidth, double designMinHeight) {
        Screen screen = currentScreen();
        Rectangle2D visual = screen.getVisualBounds();
        WindowSizing.Bounds fitted = WindowSizing.fit(
                visual.getMinX(), visual.getMinY(), visual.getWidth(), visual.getHeight(),
                preferredWidth, preferredHeight, designMinWidth, designMinHeight, SCREEN_MARGIN);

        stage.setFullScreen(false);
        stage.setMaximized(false);
        // Clear inherited constraints before changing geometry. The maximum remains unbounded
        // so native maximize and F11 can still occupy the complete display.
        stage.setMinWidth(0);
        stage.setMinHeight(0);
        stage.setMaxWidth(Double.MAX_VALUE);
        stage.setMaxHeight(Double.MAX_VALUE);
        stage.setWidth(fitted.width());
        stage.setHeight(fitted.height());
        stage.setX(fitted.x());
        stage.setY(fitted.y());
        stage.setMinWidth(Math.min(fitted.minWidth(), fitted.width()));
        stage.setMinHeight(Math.min(fitted.minHeight(), fitted.height()));
    }

    private Screen currentScreen() {
        if (stage != null && stage.isShowing()
                && Double.isFinite(stage.getX()) && Double.isFinite(stage.getY())
                && stage.getWidth() > 0 && stage.getHeight() > 0) {
            return Screen.getScreensForRectangle(stage.getX(), stage.getY(), stage.getWidth(), stage.getHeight())
                    .stream()
                    .max(Comparator.comparingDouble(screen -> intersectionArea(
                            screen.getVisualBounds(), stage.getX(), stage.getY(), stage.getWidth(), stage.getHeight())))
                    .orElse(Screen.getPrimary());
        }
        return Screen.getPrimary();
    }

    private static double intersectionArea(Rectangle2D bounds, double x, double y, double width, double height) {
        double overlapWidth = Math.max(0, Math.min(bounds.getMaxX(), x + width) - Math.max(bounds.getMinX(), x));
        double overlapHeight = Math.max(0, Math.min(bounds.getMaxY(), y + height) - Math.max(bounds.getMinY(), y));
        return overlapWidth * overlapHeight;
    }

    /** Keeps a window inside a smaller monitor after it has been moved between displays. */
    private void clampExistingWindow() {
        if (stage.isMaximized() || stage.isFullScreen()) return;
        Rectangle2D visual = currentScreen().getVisualBounds();
        double availableWidth = Math.max(1, visual.getWidth() - SCREEN_MARGIN * 2);
        double availableHeight = Math.max(1, visual.getHeight() - SCREEN_MARGIN * 2);
        double width = Math.min(stage.getWidth(), availableWidth);
        double height = Math.min(stage.getHeight(), availableHeight);
        double designMinWidth = workspaceMode ? 760 : 720;
        double designMinHeight = workspaceMode ? 520 : 500;
        double minX = visual.getMinX() + SCREEN_MARGIN;
        double minY = visual.getMinY() + SCREEN_MARGIN;
        double x = Math.max(minX, Math.min(stage.getX(), visual.getMaxX() - SCREEN_MARGIN - width));
        double y = Math.max(minY, Math.min(stage.getY(), visual.getMaxY() - SCREEN_MARGIN - height));

        stage.setMinWidth(0);
        stage.setMinHeight(0);
        stage.setMaxWidth(Double.MAX_VALUE);
        stage.setMaxHeight(Double.MAX_VALUE);
        stage.setMinWidth(Math.min(designMinWidth, availableWidth));
        stage.setMinHeight(Math.min(designMinHeight, availableHeight));
        stage.setWidth(width);
        stage.setHeight(height);
        stage.setX(x);
        stage.setY(y);
    }

    private void toggleFullScreen() {
        if (stage.isFullScreen()) {
            stage.setFullScreen(false);
            Platform.runLater(this::clampExistingWindow);
        } else {
            stage.setFullScreenExitHint("Press F11 or Esc to exit full screen");
            stage.setFullScreen(true);
        }
    }

    private void showErrorAndReturnToLogin(Throwable throwable) {
        showError(throwable);
        showLogin(true);
    }

    private void showError(Throwable throwable) {
        Throwable cause = throwable;
        while (cause.getCause() != null) cause = cause.getCause();
        Alert alert = new Alert(Alert.AlertType.ERROR,
                cause.getMessage() == null ? cause.getClass().getSimpleName() : cause.getMessage(), ButtonType.OK);
        alert.setTitle("FINORA OS");
        alert.setHeaderText("This action could not be completed");
        if (stage.isShowing()) alert.initOwner(stage);
        alert.showAndWait();
    }

    private void fatalStartupError(Throwable throwable) {
        showError(throwable);
        Platform.exit();
    }

    public static void main(String[] args) {
        launch(args);
    }
}
