package com.spydrone.baraddur.repository;

import com.spydrone.baraddur.model.LotStageEvent;
import java.util.List;

public class InMemoryStageEventRepository implements StageEventRepository {

    @Override
    public List<LotStageEvent> findUnprocessed() {
        // TODO: replace with database implementation
        return List.of();
    }

    @Override
    public void markProcessed(String eventId) {
        // TODO: replace with database implementation
    }
}
