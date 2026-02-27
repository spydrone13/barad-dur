package com.spydrone.baraddur.repository;

import com.spydrone.baraddur.model.LotStageEvent;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
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
