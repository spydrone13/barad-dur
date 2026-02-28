package com.spydrone.baraddur.dto;

public record WeeklyCell(String stage, int waferCount, int lotCount, int orderCount, int threshold, int cumulativeWaferCount) {}
