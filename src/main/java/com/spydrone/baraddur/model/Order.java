package com.spydrone.baraddur.model;

public record Order(
        String id,
        String customer,
        String product,
        String orderDate,
        String dueDate,
        String status,
        String priority
) {}
