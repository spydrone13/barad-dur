package com.spydrone.baraddur.dto;

import java.util.List;

public record WeeklyRow(
    String weekLabel,
    List<Integer> waferCells,
    List<Integer> lotCells,
    List<Integer> orderCells,
    int rowTotal,
    boolean isPrior
) {}
