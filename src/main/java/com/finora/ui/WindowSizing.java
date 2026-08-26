package com.finora.ui;

/** Pure window-bound calculation kept separate so it can be tested without starting JavaFX. */
public final class WindowSizing {
    public record Bounds(double x, double y, double width, double height,
                         double minWidth, double minHeight, double maxWidth, double maxHeight) {
    }

    private WindowSizing() {
    }

    public static Bounds fit(double screenX, double screenY, double screenWidth, double screenHeight,
                             double preferredWidth, double preferredHeight,
                             double designMinWidth, double designMinHeight, double requestedMargin) {
        if (screenWidth <= 0 || screenHeight <= 0) throw new IllegalArgumentException("Screen bounds must be positive.");
        double horizontalMargin = Math.min(Math.max(0, requestedMargin), screenWidth / 4.0);
        double verticalMargin = Math.min(Math.max(0, requestedMargin), screenHeight / 4.0);
        double availableWidth = Math.max(1, screenWidth - horizontalMargin * 2);
        double availableHeight = Math.max(1, screenHeight - verticalMargin * 2);
        double width = Math.min(Math.max(1, preferredWidth), availableWidth);
        double height = Math.min(Math.max(1, preferredHeight), availableHeight);
        double minWidth = Math.min(Math.max(1, designMinWidth), availableWidth);
        double minHeight = Math.min(Math.max(1, designMinHeight), availableHeight);
        double x = screenX + (screenWidth - width) / 2.0;
        double y = screenY + (screenHeight - height) / 2.0;
        return new Bounds(x, y, width, height, minWidth, minHeight, availableWidth, availableHeight);
    }
}
