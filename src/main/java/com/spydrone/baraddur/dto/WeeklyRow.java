package com.spydrone.baraddur.dto;

import java.util.List;

public record WeeklyRow(
    String weekLabel,
    List<WeeklyCell> cells,
    int rowTotal,
    boolean isPrior
) {}
