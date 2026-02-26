package com.spydrone.baraddur.model;

public record Lot(
        String id,
        String product,
        int wafers,
        String stage,
        String priority,
        String status,
        String operator,
        String target,
        String orderId
) {}
