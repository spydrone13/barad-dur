package com.spydrone.baraddur.controller;

import com.spydrone.baraddur.dto.WeeklyTotalsResponse;
import com.spydrone.baraddur.service.LotService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class WeeklyTotalsController {

    private final LotService lotService;

    public WeeklyTotalsController(LotService lotService) {
        this.lotService = lotService;
    }

    @GetMapping("/weekly-totals")
    public WeeklyTotalsResponse weeklyTotals() {
        return lotService.getWeeklyTotals();
    }
}
