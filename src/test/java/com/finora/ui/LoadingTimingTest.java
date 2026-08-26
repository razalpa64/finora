package com.finora.ui;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class LoadingTimingTest {
    @Test void fastStartupRemainsVisibleForRestOfTwoSeconds() {
        long start=1_000_000_000L;
        long after350Millis=start+350_000_000L;
        assertEquals(1650.0,LoadingView.remainingMillis(start,after350Millis,2000),0.001);
    }

    @Test void slowStartupIsNeverDelayedAgain() {
        long start=1_000_000_000L;
        long afterTwoAndHalfSeconds=start+2_500_000_000L;
        assertEquals(0.0,LoadingView.remainingMillis(start,afterTwoAndHalfSeconds,2000),0.001);
    }
}
