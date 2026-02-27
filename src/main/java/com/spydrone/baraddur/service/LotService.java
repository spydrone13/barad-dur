package com.spydrone.baraddur.service;

import com.spydrone.baraddur.dto.OrderResponse;
import com.spydrone.baraddur.dto.WeeklyTotalsResponse;
import com.spydrone.baraddur.model.Lot;
import com.spydrone.baraddur.model.Order;
import com.spydrone.baraddur.repository.LotRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LotService {

    static final List<Order> ORDERS = List.of(
            new Order("ORD-26-001", "Gondor Electronics", "BD-7 Logic",         "Feb 1", "Mar 8",  "in-progress", "high"),
            new Order("ORD-26-002", "Rivendell Systems",  "BD-5 SRAM",          "Feb 3", "Mar 10", "in-progress", "normal"),
            new Order("ORD-26-003", "Mirkwood Comms",     "BD-9 RF",            "Feb 5", "Mar 5",  "in-progress", "high"),
            new Order("ORD-26-004", "Dwarven Foundry",    "BD-3 Power",         "Feb 8", "Mar 20", "on-hold",     "low"),
            new Order("ORD-26-005", "Elrond Integrated",  "BD-12 Mixed-Signal", "Jan 20","Mar 15", "in-progress", "normal"),
            new Order("ORD-26-006", "Lothlórien Devices", "BD-14 Analog",       "Jan 25","Mar 28", "in-progress", "low")
    );

    private final LotRepository lotRepository;
    private final WeeklyProjectionService weeklyProjectionService;

    public LotService(LotRepository lotRepository, WeeklyProjectionService weeklyProjectionService) {
        this.lotRepository = lotRepository;
        this.weeklyProjectionService = weeklyProjectionService;
    }

    public List<OrderResponse> getOrders() {
        return ORDERS.stream()
                .map(o -> buildOrderResponse(o, getLotsByOrder(o.id())))
                .toList();
    }

    public Optional<OrderResponse> getOrder(String orderId) {
        return ORDERS.stream()
                .filter(o -> o.id().equals(orderId))
                .findFirst()
                .map(o -> buildOrderResponse(o, getLotsByOrder(orderId)));
    }

    private List<Lot> getLotsByOrder(String orderId) {
        return lotRepository.findAll().stream()
                .filter(l -> orderId.equals(l.getOrderId()))
                .toList();
    }

    private OrderResponse buildOrderResponse(Order order, List<Lot> lots) {
        int totalWafers = lots.stream().mapToInt(Lot::getWafers).sum();
        return new OrderResponse(order, lots, lots.size(), totalWafers);
    }

    public WeeklyTotalsResponse getWeeklyTotals() {
        return weeklyProjectionService.getWeeklyTotals();
    }

    public List<Lot> getLotsForStageAndWeek(String stage, String weekLabel) {
        return weeklyProjectionService.getLotsForStageAndWeek(stage, weekLabel);
    }
}
