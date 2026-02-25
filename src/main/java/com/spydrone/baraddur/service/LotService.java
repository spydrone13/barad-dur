package com.spydrone.baraddur.service;

import com.spydrone.baraddur.dto.WeeklyRow;
import com.spydrone.baraddur.dto.WeeklyTotalsResponse;
import com.spydrone.baraddur.model.Lot;
import com.spydrone.baraddur.repository.LotRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.MonthDay;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class LotService {

    private static final List<String> STAGES = List.of(
            "WAFER START", "OXIDATION", "LITHO", "ETCH", "IMPLANT",
            "DIFFUSION", "CVD", "CMP", "METAL", "PASSIVATION",
            "PROBE", "DICING", "PACKAGING", "FINAL TEST", "SHIP"
    );

    private final LotRepository lotRepository;

    public LotService(LotRepository lotRepository) {
        this.lotRepository = lotRepository;
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
