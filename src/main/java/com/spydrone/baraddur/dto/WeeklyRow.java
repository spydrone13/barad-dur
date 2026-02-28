package com.spydrone.baraddur.dto;

import java.util.List;

public record WeeklyRow(
    String weekLabel,
    List<WeeklyCell> cells,
    int rowTotal,
    int rowLotTotal,
    int rowOrderTotal,
    boolean isPrior
) {}
