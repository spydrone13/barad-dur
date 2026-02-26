package com.spydrone.baraddur.dto;

public record LotSummaryResponse(
        int totalLots,
        int activeLots,
        int onHold,
        int delayed,
        int totalWafers
) {}
