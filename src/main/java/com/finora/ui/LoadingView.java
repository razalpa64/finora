package com.finora.ui;

import javafx.animation.*;
import javafx.geometry.Pos;
import javafx.scene.control.Label;
import javafx.scene.control.ProgressBar;
import javafx.scene.layout.HBox;
import javafx.scene.layout.StackPane;
import javafx.scene.layout.VBox;
import javafx.scene.shape.Circle;
import javafx.util.Duration;

public final class LoadingView {
    private final StackPane root = new StackPane();
    private final Label status = Ui.label("Starting FINORA OS", "loading-status");
    private final Label detail = Ui.label("Your records stay on this device", "loading-detail");
    private final ProgressBar progress = new ProgressBar(0.05);
    private final StackPane[] stepDots = new StackPane[3];
    private final Label[] stepTitles = new Label[3];
    private final Timeline dots;
    private final ScaleTransition pulse;
    private final long createdAtNanos = System.nanoTime();
    private PauseTransition completionDelay;

    public LoadingView() {
        root.getStyleClass().addAll("loading-screen", "light-theme");
        Circle glowLarge = new Circle(260);
        glowLarge.getStyleClass().add("loading-glow-large");
        glowLarge.setTranslateX(-360);
        glowLarge.setTranslateY(-250);
        Circle glowSmall = new Circle(190);
        glowSmall.getStyleClass().add("loading-glow-small");
        glowSmall.setTranslateX(430);
        glowSmall.setTranslateY(280);

        StackPane mark = new StackPane(Ui.label("F", "loading-mark-letter"));
        mark.getStyleClass().add("loading-mark");
        Label brand = Ui.label("FINORA", "loading-brand");
        Label product = Ui.label("PERSONAL FINANCIAL OPERATING SYSTEM", "loading-product");
        Label offline = Ui.label("●  LOCAL STARTUP", "offline-chip");
        progress.setPrefWidth(390);
        progress.setMaxWidth(390);
        progress.getStyleClass().add("boot-progress");

        HBox steps = new HBox(28,
                step(0, "1", "LOCAL DATABASE"),
                step(1, "2", "SECURE SESSION"),
                step(2, "3", "FINANCIAL ENGINE"));
        steps.setAlignment(Pos.CENTER);
        steps.getStyleClass().add("loading-steps");
        setStep(1);

        VBox center = new VBox(12, mark, brand, product, offline, progress, status, detail, steps);
        center.setAlignment(Pos.CENTER);
        center.getStyleClass().add("loading-center");
        root.getChildren().addAll(glowLarge, glowSmall, center);

        pulse = new ScaleTransition(Duration.seconds(1.25), mark);
        pulse.setFromX(1);
        pulse.setFromY(1);
        pulse.setToX(1.06);
        pulse.setToY(1.06);
        pulse.setAutoReverse(true);
        pulse.setCycleCount(Animation.INDEFINITE);
        pulse.setInterpolator(Interpolator.EASE_BOTH);
        pulse.play();

        dots = new Timeline(new KeyFrame(Duration.millis(480), event -> {
            String text = status.getText().replaceAll("\\.{1,3}$", "");
            int count = status.getText().length() - text.length();
            status.setText(text + ".".repeat((count % 3) + 1));
        }));
        dots.setCycleCount(Animation.INDEFINITE);
        dots.play();
    }

    private VBox step(int index, String number, String title) {
        Label numeral = Ui.label(number, "loading-step-number");
        StackPane dot = new StackPane(numeral);
        dot.getStyleClass().add("loading-step-dot");
        Label label = Ui.label(title, "loading-step-title");
        stepDots[index] = dot;
        stepTitles[index] = label;
        VBox box = new VBox(7, dot, label);
        box.setAlignment(Pos.CENTER);
        return box;
    }

    public StackPane root() { return root; }

    public void update(String message, double value, String supportingText) {
        update(message, value, supportingText, value < .55 ? 1 : value < .9 ? 2 : 3);
    }

    public void update(String message, double value, String supportingText, int step) {
        status.setText(message == null ? "Loading" : message.replaceAll("\\.{1,3}$", ""));
        progress.setProgress(Math.max(0, Math.min(1, value)));
        if (supportingText != null && !supportingText.isBlank()) detail.setText(supportingText);
        setStep(step);
    }

    private void setStep(int current) {
        for (int i = 0; i < stepDots.length; i++) {
            stepDots[i].getStyleClass().removeAll("step-active", "step-complete", "step-pending");
            stepTitles[i].getStyleClass().removeAll("step-title-active", "step-title-complete");
            int number = i + 1;
            if (number < current) {
                stepDots[i].getStyleClass().add("step-complete");
                stepTitles[i].getStyleClass().add("step-title-complete");
                ((Label) stepDots[i].getChildren().getFirst()).setText("✓");
            } else if (number == current) {
                stepDots[i].getStyleClass().add("step-active");
                stepTitles[i].getStyleClass().add("step-title-active");
                ((Label) stepDots[i].getChildren().getFirst()).setText(String.valueOf(number));
            } else {
                stepDots[i].getStyleClass().add("step-pending");
                ((Label) stepDots[i].getChildren().getFirst()).setText(String.valueOf(number));
            }
        }
    }

    /** Keeps a successful loading screen visible long enough to be readable without delaying real work. */
    public void completeAfter(Duration minimumVisibleTime, Runnable transition) {
        if (transition == null) return;
        double minimumMillis = minimumVisibleTime == null ? 0 : Math.max(0, minimumVisibleTime.toMillis());
        double remainingMillis = remainingMillis(createdAtNanos, System.nanoTime(), minimumMillis);
        if (completionDelay != null) completionDelay.stop();
        completionDelay = new PauseTransition(Duration.millis(remainingMillis));
        completionDelay.setOnFinished(event -> {
            completionDelay = null;
            stop();
            transition.run();
        });
        completionDelay.play();
    }

    static double remainingMillis(long startedAtNanos, long nowNanos, double minimumMillis) {
        double elapsedMillis = Math.max(0, nowNanos - startedAtNanos) / 1_000_000.0;
        return Math.max(0, Math.max(0, minimumMillis) - elapsedMillis);
    }

    public void stop() {
        if (completionDelay != null) {
            completionDelay.stop();
            completionDelay = null;
        }
        pulse.stop();
        dots.stop();
    }
}
