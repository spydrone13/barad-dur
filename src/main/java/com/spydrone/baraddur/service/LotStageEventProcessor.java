package com.spydrone.baraddur.service;

import com.spydrone.baraddur.repository.LotRepository;
import com.spydrone.baraddur.repository.StageEventRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Service
public class LotStageEventProcessor {

    private static final Logger log = LoggerFactory.getLogger(LotStageEventProcessor.class);

    private final StageEventRepository stageEventRepository;
    private final LotRepository lotRepository;
    private final WeeklyProjectionService weeklyProjectionService;

    public LotStageEventProcessor(StageEventRepository stageEventRepository,
                                   LotRepository lotRepository,
                                   WeeklyProjectionService weeklyProjectionService) {
        this.stageEventRepository = stageEventRepository;
        this.lotRepository = lotRepository;
        this.weeklyProjectionService = weeklyProjectionService;
    }

    @Scheduled(fixedDelay = 5000, initialDelay = 15000)
    public void processEvents() {
        log.info("Processing events...");
        stageEventRepository.findUnprocessed().forEach(event ->
            lotRepository.findById(event.lotId()).ifPresentOrElse(lot -> {
                String oldStage = lot.getStage();
                log.info("Moving lot {} from stage '{}' to '{}'", lot.getId(), oldStage, event.newStage());
                lot.moveToStage(event.newStage());
                lotRepository.save(lot);
                stageEventRepository.markProcessed(event.eventId());
                log.debug("Event {} processed", event.eventId());
                weeklyProjectionService.onLotMoved(lot, oldStage);
            }, () -> log.warn("Event {} references unknown lot {}", event.eventId(), event.lotId()))
        );
    }
}
