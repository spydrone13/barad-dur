package com.spydrone.baraddur.service;

import com.spydrone.baraddur.dto.OrderResponse;
import com.spydrone.baraddur.dto.WeeklyRow;
import com.spydrone.baraddur.dto.WeeklyTotalsResponse;
import com.spydrone.baraddur.model.Lot;
import com.spydrone.baraddur.model.Order;
import com.spydrone.baraddur.repository.LotRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.MonthDay;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
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

    private static final List<String> STAGES = List.of(
            "WAFER START", "OXIDATION", "LITHO", "ETCH", "IMPLANT",
            "DIFFUSION", "CVD", "CMP", "METAL", "PASSIVATION",
            "PROBE", "DICING", "PACKAGING", "FINAL TEST", "SHIP"
    );

    private final LotRepository lotRepository;

    public LotService(LotRepository lotRepository) {
        this.lotRepository = lotRepository;
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
                .filter(l -> orderId.equals(l.orderId()))
                .toList();
    }

    private OrderResponse buildOrderResponse(Order order, List<Lot> lots) {
        int totalWafers = lots.stream().mapToInt(Lot::wafers).sum();
        return new OrderResponse(order, lots, lots.size(), totalWafers);
    }

    public WeeklyTotalsResponse getWeeklyTotals() {
        record WeekBucket(String label, LocalDate start, LocalDate end) {}

        List<WeekBucket> buckets = List.of(
                new WeekBucket("Week of Feb 2",  LocalDate.of(2026, 2, 2),  LocalDate.of(2026, 2, 9)),
                new WeekBucket("Week of Feb 9",  LocalDate.of(2026, 2, 9),  LocalDate.of(2026, 2, 16)),
                new WeekBucket("Week of Feb 16", LocalDate.of(2026, 2, 16), LocalDate.of(2026, 2, 23)),
                new WeekBucket("Week of Feb 23", LocalDate.of(2026, 2, 23), LocalDate.of(2026, 3, 2)),
                new WeekBucket("Week of Mar 2",  LocalDate.of(2026, 3, 2),  LocalDate.of(2026, 3, 9)),
                new WeekBucket("Week of Mar 9",  LocalDate.of(2026, 3, 9),  LocalDate.of(2026, 3, 16)),
                new WeekBucket("Week of Mar 16", LocalDate.of(2026, 3, 16), LocalDate.of(2026, 3, 23)),
                new WeekBucket("Week of Mar 23", LocalDate.of(2026, 3, 23), LocalDate.of(2026, 3, 30))
        );

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM d", Locale.ENGLISH);
        int[][] grid = new int[buckets.size()][STAGES.size()];

        for (Lot lot : lotRepository.findAll()) {
            MonthDay md = MonthDay.parse(lot.target(), fmt);
            LocalDate date = md.atYear(2026);
            int wi = -1;
            for (int i = 0; i < buckets.size(); i++) {
                WeekBucket b = buckets.get(i);
                if (!date.isBefore(b.start()) && date.isBefore(b.end())) {
                    wi = i;
                    break;
                }
            }
            int si = STAGES.indexOf(lot.stage());
            if (wi >= 0 && si >= 0) grid[wi][si] += lot.wafers();
        }

        int maxCellValue = 1;
        List<WeeklyRow> rows = new ArrayList<>();
        for (int wi = 0; wi < buckets.size(); wi++) {
            List<Integer> cells = new ArrayList<>();
            int rowTotal = 0;
            for (int si = 0; si < STAGES.size(); si++) {
                cells.add(grid[wi][si]);
                rowTotal += grid[wi][si];
                if (grid[wi][si] > maxCellValue) maxCellValue = grid[wi][si];
            }
            rows.add(new WeeklyRow(buckets.get(wi).label(), cells, rowTotal));
        }

        return new WeeklyTotalsResponse(STAGES, rows, maxCellValue);
    }
}
