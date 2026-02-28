package com.spydrone.baraddur.service;

import com.spydrone.baraddur.dto.WeeklyCell;
import com.spydrone.baraddur.dto.WeeklyRow;
import com.spydrone.baraddur.dto.WeeklyTotalRow;
import com.spydrone.baraddur.dto.WeeklyTotalsResponse;
import com.spydrone.baraddur.model.Lot;
import com.spydrone.baraddur.repository.LotRepository;
import com.spydrone.baraddur.repository.WeeklyTotalsMapper;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.MonthDay;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
public class WeeklyProjectionService {

    static final int WAFERS_PER_DAY = 25;

    static final List<String> STAGES = List.of(
            "WAFER START", "OXIDATION", "LITHO", "ETCH", "IMPLANT",
            "DIFFUSION", "CVD", "CMP", "METAL", "PASSIVATION",
            "PROBE", "DICING", "PACKAGING", "FINAL TEST", "SHIP"
    );

    private record WeekBucket(String label, LocalDate start, LocalDate end) {}

    private static List<WeekBucket> weekBuckets() {
        return List.of(
                new WeekBucket("Week of Feb 2",  LocalDate.of(2026, 2, 2),  LocalDate.of(2026, 2, 9)),
                new WeekBucket("Week of Feb 9",  LocalDate.of(2026, 2, 9),  LocalDate.of(2026, 2, 16)),
                new WeekBucket("Week of Feb 16", LocalDate.of(2026, 2, 16), LocalDate.of(2026, 2, 23)),
                new WeekBucket("Week of Feb 23", LocalDate.of(2026, 2, 23), LocalDate.of(2026, 3, 2)),
                new WeekBucket("Week of Mar 2",  LocalDate.of(2026, 3, 2),  LocalDate.of(2026, 3, 9)),
                new WeekBucket("Week of Mar 9",  LocalDate.of(2026, 3, 9),  LocalDate.of(2026, 3, 16)),
                new WeekBucket("Week of Mar 16", LocalDate.of(2026, 3, 16), LocalDate.of(2026, 3, 23)),
                new WeekBucket("Week of Mar 23", LocalDate.of(2026, 3, 23), LocalDate.of(2026, 3, 30))
        );
    }

    private final WeeklyTotalsMapper weeklyTotalsMapper;
    private final LotRepository lotRepository;

    public WeeklyProjectionService(WeeklyTotalsMapper weeklyTotalsMapper, LotRepository lotRepository) {
        this.weeklyTotalsMapper = weeklyTotalsMapper;
        this.lotRepository = lotRepository;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void initProjection() {
        List<WeekBucket> buckets = weekBuckets();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM d", Locale.ENGLISH);

        // Map: weekLabel -> stage -> accumulator
        Map<String, Map<String, CellAccumulator>> grid = new HashMap<>();
        for (WeekBucket b : buckets) {
            Map<String, CellAccumulator> stageMap = new HashMap<>();
            for (String stage : STAGES) {
                stageMap.put(stage, new CellAccumulator());
            }
            grid.put(b.label(), stageMap);
        }

        for (Lot lot : lotRepository.findAll()) {
            try {
                LocalDate date = MonthDay.parse(lot.getTarget(), fmt).atYear(2026);
                for (WeekBucket b : buckets) {
                    if (!date.isBefore(b.start()) && date.isBefore(b.end())) {
                        int si = STAGES.indexOf(lot.getStage());
                        if (si >= 0) {
                            CellAccumulator acc = grid.get(b.label()).get(lot.getStage());
                            acc.waferCount += lot.getWafers();
                            acc.lotCount += 1;
                            if (lot.getOrderId() != null) acc.orderIds.add(lot.getOrderId());
                        }
                        break;
                    }
                }
            } catch (Exception ignored) {}
        }

        for (WeekBucket b : buckets) {
            for (String stage : STAGES) {
                CellAccumulator acc = grid.get(b.label()).get(stage);
                weeklyTotalsMapper.upsertCell(b.label(), stage, acc.waferCount, acc.lotCount, acc.orderIds.size());
            }
        }
    }

    public void onLotMoved(Lot lot, String oldStage) {
        String weekLabel = getWeekLabel(lot.getTarget());
        if (weekLabel == null) return;

        WeekBucket bucket = weekBuckets().stream()
                .filter(b -> b.label().equals(weekLabel))
                .findFirst().orElseThrow();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM d", Locale.ENGLISH);
        String orderId = lot.getOrderId();

        // lot is already saved with new stage in DB at this point

        // Old cell: orderId is no longer here if no remaining lot in that (weekLabel, oldStage) shares it
        int oldOrderDelta = 0;
        int newOrderDelta = 0;
        if (orderId != null) {
            List<Lot> orderLots = lotRepository.getByOrderId(orderId);
            boolean orderStillInOldCell = orderLots.stream()
                    .filter(l -> oldStage.equals(l.getStage()))
                    .anyMatch(l -> inBucket(l.getTarget(), bucket, fmt));
            if (!orderStillInOldCell) oldOrderDelta = -1;

            // New cell: orderId is newly here if this is the only lot in (weekLabel, newStage) with it
            long countInNewCell = orderLots.stream()
                    .filter(l -> lot.getStage().equals(l.getStage()))
                    .filter(l -> inBucket(l.getTarget(), bucket, fmt))
                    .count();
            if (countInNewCell == 1) newOrderDelta = 1;
        }

        weeklyTotalsMapper.adjustCell(weekLabel, oldStage,        -lot.getWafers(), -1, oldOrderDelta);
        weeklyTotalsMapper.adjustCell(weekLabel, lot.getStage(),  +lot.getWafers(), +1, newOrderDelta);
    }

    private boolean inBucket(String target, WeekBucket bucket, DateTimeFormatter fmt) {
        try {
            LocalDate date = MonthDay.parse(target, fmt).atYear(2026);
            return !date.isBefore(bucket.start()) && date.isBefore(bucket.end());
        } catch (Exception e) {
            return false;
        }
    }

    public WeeklyTotalsResponse getWeeklyTotals() {
        List<WeekBucket> buckets = weekBuckets();
        List<WeeklyTotalRow> rows = weeklyTotalsMapper.findAll();

        // Index by weekLabel+stage for O(1) lookup
        Map<String, WeeklyTotalRow> index = new HashMap<>();
        for (WeeklyTotalRow row : rows) {
            index.put(row.weekLabel() + "|" + row.stage(), row);
        }

        List<WeeklyRow> weeklyRows = new ArrayList<>();

        LocalDate today = LocalDate.now();
        for (WeekBucket bucket : buckets) {
            List<WeeklyCell> cells = new ArrayList<>();
            int rowTotal = 0;
            int threshold = WAFERS_PER_DAY * remainingWorkDays(today, bucket.start(), bucket.end());

            for (String stage : STAGES) {
                WeeklyTotalRow cell = index.get(bucket.label() + "|" + stage);
                int w = cell != null ? cell.waferCount() : 0;
                int l = cell != null ? cell.lotCount()   : 0;
                int o = cell != null ? cell.orderCount() : 0;
                rowTotal += w;
                cells.add(new WeeklyCell(w, l, o, threshold));
            }

            boolean isPrior = !bucket.end().isAfter(today);
            weeklyRows.add(new WeeklyRow(bucket.label(), cells, rowTotal, isPrior));
        }

        return new WeeklyTotalsResponse(STAGES, weeklyRows);
    }

    private static int remainingWorkDays(LocalDate today, LocalDate bucketStart, LocalDate bucketEnd) {
        LocalDate from = today.isAfter(bucketStart) ? today : bucketStart;
        int count = 0;
        for (LocalDate d = from; d.isBefore(bucketEnd); d = d.plusDays(1)) {
            DayOfWeek dow = d.getDayOfWeek();
            if (dow != DayOfWeek.SATURDAY && dow != DayOfWeek.SUNDAY) {
                count++;
            }
        }
        return count;
    }

    public List<Lot> getLotsForStageAndWeek(String stage, String weekLabel) {
        WeekBucket bucket = weekBuckets().stream()
                .filter(b -> b.label().equals(weekLabel))
                .findFirst().orElse(null);
        if (bucket == null) return List.of();

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM d", Locale.ENGLISH);
        return lotRepository.findByStage(stage).stream()
                .filter(lot -> inBucket(lot.getTarget(), bucket, fmt))
                .toList();
    }

    private String getWeekLabel(String target) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM d", Locale.ENGLISH);
        try {
            LocalDate date = MonthDay.parse(target, fmt).atYear(2026);
            for (WeekBucket b : weekBuckets()) {
                if (!date.isBefore(b.start()) && date.isBefore(b.end())) {
                    return b.label();
                }
            }
        } catch (Exception ignored) {}
        return null;
    }

    private static class CellAccumulator {
        int waferCount = 0;
        int lotCount = 0;
        Set<String> orderIds = new HashSet<>();
    }
}
