package com.spydrone.baraddur.service;

import com.spydrone.baraddur.dto.OrderResponse;
import com.spydrone.baraddur.dto.WeeklyRow;
import com.spydrone.baraddur.dto.WeeklyTotalsResponse;
import com.spydrone.baraddur.model.Lot;
import com.spydrone.baraddur.model.Order;
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
            new Order("ORD-26-001", "Gondor Electronics", "BD-7 Logic",  "Feb 1", "Mar 8",  "in-progress", "high"),
            new Order("ORD-26-002", "Rivendell Systems",  "BD-5 SRAM",   "Feb 3", "Mar 10", "in-progress", "normal"),
            new Order("ORD-26-003", "Mirkwood Comms",     "BD-9 RF",     "Feb 5", "Mar 5",  "in-progress", "high"),
            new Order("ORD-26-004", "Dwarven Foundry",    "BD-3 Power",  "Feb 8", "Mar 20", "on-hold",     "low")
    );

    static final List<Lot> LOTS = List.of(
            new Lot("BD-26-0891", "BD-7 Logic",  25, "LITHO",       "high",   "on-track", "M. Baggins",    "Mar 1",  "ORD-26-001"),
            new Lot("BD-26-0892", "BD-7 Logic",  25, "ETCH",        "high",   "on-track", "S. Gamgee",     "Mar 1",  "ORD-26-001"),
            new Lot("BD-26-0885", "BD-5 SRAM",   50, "OXIDATION",   "normal", "on-track", "L. Greenleaf",  "Mar 5",  "ORD-26-002"),
            new Lot("BD-26-0880", "BD-5 SRAM",   50, "CVD",         "normal", "delayed",  "G. Stormcrow",  "Mar 3",  "ORD-26-002"),
            new Lot("BD-26-0876", "BD-9 RF",     25, "METAL",       "high",   "on-track", "A. Elessar",    "Feb 26", "ORD-26-003"),
            new Lot("BD-26-0871", "BD-9 RF",     25, "PASSIVATION", "high",   "on-track", "A. Elessar",    "Feb 25", "ORD-26-003"),
            new Lot("BD-26-0865", "BD-7 Logic",  25, "PROBE",       "normal", "on-track", "B. Baggins",    "Feb 24", "ORD-26-001"),
            new Lot("BD-26-0860", "BD-3 Power",  75, "IMPLANT",     "low",    "hold",     "T. Took",       "Mar 10", "ORD-26-004"),
            new Lot("BD-26-0855", "BD-3 Power",  75, "WAFER START", "normal", "on-track", "M. Brandybuck", "Mar 18", "ORD-26-004"),
            new Lot("BD-26-0849", "BD-5 SRAM",   50, "DIFFUSION",   "normal", "on-track", "F. Baggins",    "Mar 6",  "ORD-26-002"),
            new Lot("BD-26-0844", "BD-7 Logic",  25, "CMP",         "high",   "delayed",  "G. Stormcrow",  "Feb 27", "ORD-26-001"),
            new Lot("BD-26-0839", "BD-9 RF",     25, "DICING",      "normal", "on-track", "L. Greenleaf",  "Feb 24", "ORD-26-003"),
            new Lot("BD-26-0834", "BD-3 Power",  75, "PACKAGING",   "low",    "on-track", "S. Gamgee",     "Feb 25", "ORD-26-004"),
            new Lot("BD-26-0829", "BD-5 SRAM",   50, "FINAL TEST",  "high",   "on-track", "A. Elessar",    "Feb 23", "ORD-26-002"),
            new Lot("BD-26-0824", "BD-7 Logic",  25, "LITHO",       "normal", "hold",     "T. Took",       "Mar 4",  "ORD-26-001"),
            new Lot("BD-26-0819", "BD-9 RF",     25, "ETCH",        "low",    "on-track", "M. Baggins",    "Mar 5",  "ORD-26-003"),
            new Lot("BD-26-0814", "BD-3 Power",  75, "OXIDATION",   "normal", "on-track", "B. Baggins",    "Mar 12", "ORD-26-004"),
            new Lot("BD-26-0809", "BD-5 SRAM",   50, "CVD",         "high",   "on-track", "M. Brandybuck", "Mar 7",  "ORD-26-002"),
            new Lot("BD-26-0804", "BD-7 Logic",  25, "METAL",       "normal", "on-track", "F. Baggins",    "Mar 2",  "ORD-26-001"),
            new Lot("BD-26-0799", "BD-9 RF",     25, "PROBE",       "high",   "delayed",  "G. Stormcrow",  "Feb 24", "ORD-26-003"),
            new Lot("BD-26-0794", "BD-3 Power",  75, "IMPLANT",     "normal", "hold",     "T. Took",       "Mar 8",  "ORD-26-004")
    );

    private static final List<String> STAGES = List.of(
            "WAFER START", "OXIDATION", "LITHO", "ETCH", "IMPLANT",
            "DIFFUSION", "CVD", "CMP", "METAL", "PASSIVATION",
            "PROBE", "DICING", "PACKAGING", "FINAL TEST", "SHIP"
    );

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
        return LOTS.stream()
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
                new WeekBucket("Week of Feb 23", LocalDate.of(2026, 2, 23), LocalDate.of(2026, 3, 1)),
                new WeekBucket("Week of Mar 1",  LocalDate.of(2026, 3, 1),  LocalDate.of(2026, 3, 8)),
                new WeekBucket("Week of Mar 8",  LocalDate.of(2026, 3, 8),  LocalDate.of(2026, 3, 18)),
                new WeekBucket("Week of Mar 18", LocalDate.of(2026, 3, 18), LocalDate.of(2026, 12, 31))
        );

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM d", Locale.ENGLISH);
        int[][] grid = new int[buckets.size()][STAGES.size()];

        for (Lot lot : LOTS) {
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
