package com.spydrone.baraddur.repository;

import com.spydrone.baraddur.model.LotStageEvent;

import java.util.List;

public interface StageEventRepository {
    List<LotStageEvent> findUnprocessed();
    void markProcessed(String eventId);
}
