package com.spydrone.baraddur.controller;

import com.spydrone.baraddur.dto.LotSummaryResponse;
import com.spydrone.baraddur.model.Lot;
import com.spydrone.baraddur.repository.LotRepository;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/lots")
public class LotController {

    private final LotRepository lotRepository;

    public LotController(LotRepository lotRepository) {
        this.lotRepository = lotRepository;
    }

    @GetMapping
    public List<Lot> getLots(@RequestParam(required = false) String status) {
        if (status != null) {
            return lotRepository.findByStatus(status);
        }
        return lotRepository.findAll();
    }

    @GetMapping("/summary")
    public LotSummaryResponse getSummary() {
        List<Lot> all = lotRepository.findAll();
        int totalLots = all.size();
        int activeLots = (int) all.stream().filter(l -> "on-track".equals(l.status())).count();
        int onHold     = (int) all.stream().filter(l -> "hold".equals(l.status())).count();
        int delayed    = (int) all.stream().filter(l -> "delayed".equals(l.status())).count();
        int totalWafers = all.stream().mapToInt(Lot::wafers).sum();
        return new LotSummaryResponse(totalLots, activeLots, onHold, delayed, totalWafers);
    }
}
