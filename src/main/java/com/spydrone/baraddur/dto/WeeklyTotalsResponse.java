package com.spydrone.baraddur.dto;

import java.util.List;

public record WeeklyTotalsResponse(
    List<String> stages,
    List<WeeklyRow> rows,
    int maxWaferValue,
    int maxLotValue,
    int maxOrderValue
) {}
