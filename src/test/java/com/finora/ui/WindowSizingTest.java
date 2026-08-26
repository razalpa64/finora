package com.finora.ui;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class WindowSizingTest {
    @Test void revisedLaptopDefaultLeavesAVisibleSafetyBorder() {
        var bounds = WindowSizing.fit(0, 0, 1366, 728, 1280, 760, 760, 520, 28);
        assertEquals(1280, bounds.width());
        assertEquals(672, bounds.height());
        assertEquals(43, bounds.x());
        assertEquals(28, bounds.y());
        assertTrue(bounds.x()+bounds.width()<=1366-28);
        assertTrue(bounds.y()+bounds.height()<=728-28);
    }

    @Test void standardLaptopNeverCrossesVisualBounds() {
        var bounds = WindowSizing.fit(0, 0, 1366, 728, 1400, 880, 900, 580, 16);
        assertEquals(1334, bounds.width());
        assertEquals(696, bounds.height());
        assertTrue(bounds.x() >= 0 && bounds.y() >= 0);
        assertTrue(bounds.x() + bounds.width() <= 1366);
        assertTrue(bounds.y() + bounds.height() <= 728);
    }

    @Test void smallScreenAlsoClampsInheritedMinimums() {
        var bounds = WindowSizing.fit(0, 0, 800, 560, 1400, 880, 900, 580, 16);
        assertEquals(768, bounds.width());
        assertEquals(528, bounds.height());
        assertEquals(768, bounds.minWidth());
        assertEquals(528, bounds.minHeight());
    }

    @Test void centeredBoundsRespectAnOffsetSecondaryMonitor() {
        var bounds = WindowSizing.fit(-1920, 40, 1920, 1040, 1400, 880, 900, 580, 16);
        assertTrue(bounds.x() >= -1920);
        assertTrue(bounds.y() >= 40);
        assertTrue(bounds.x() + bounds.width() <= 0);
        assertTrue(bounds.y() + bounds.height() <= 1080);
    }
}
