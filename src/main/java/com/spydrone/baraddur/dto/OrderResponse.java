package com.spydrone.baraddur.dto;

import com.spydrone.baraddur.model.Lot;
import com.spydrone.baraddur.model.Order;

import java.util.List;

public record OrderResponse(
        Order order,
        List<Lot> lots,
        int lotCount,
        int totalWafers
) {}
