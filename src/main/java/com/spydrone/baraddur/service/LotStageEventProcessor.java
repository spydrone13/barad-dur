package com.spydrone.baraddur.service;

import com.spydrone.baraddur.model.Lot;
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
                Lot updatedLot = new Lot(
                        lot.id(),
                        lot.product(),
                        lot.wafers(),
                        event.newStage(),
                        lot.priority(),
                        lot.status(),
                        lot.operator(),
                        lot.target(),
                        lot.orderId()
                );
                lotRepository.save(updatedLot);
                stageEventRepository.markProcessed(event.eventId());
            })
        );
    }
}
