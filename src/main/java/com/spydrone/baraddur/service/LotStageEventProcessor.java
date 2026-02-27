package com.spydrone.baraddur.service;

import com.spydrone.baraddur.repository.LotRepository;
import com.spydrone.baraddur.repository.StageEventRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class LotStageEventProcessor {

    private final StageEventRepository stageEventRepository;
    private final LotRepository lotRepository;

    public LotStageEventProcessor(StageEventRepository stageEventRepository, LotRepository lotRepository) {
        this.stageEventRepository = stageEventRepository;
        this.lotRepository = lotRepository;
    }

    @Scheduled(fixedDelay = 5000)
    public void processEvents() {
        stageEventRepository.findUnprocessed().forEach(event ->
            lotRepository.findById(event.lotId()).ifPresent(lot -> {
                lot.moveToStage(event.newStage());
                lotRepository.save(lot);
                stageEventRepository.markProcessed(event.eventId());
            })
        );
    }
}
