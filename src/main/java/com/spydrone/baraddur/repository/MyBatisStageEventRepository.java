package com.spydrone.baraddur.repository;

import com.spydrone.baraddur.model.LotStageEvent;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class MyBatisStageEventRepository implements StageEventRepository {

    private final StageEventMapper stageEventMapper;

    public MyBatisStageEventRepository(StageEventMapper stageEventMapper) {
        this.stageEventMapper = stageEventMapper;
    }

    @Override
    public List<LotStageEvent> findUnprocessed() {
        return stageEventMapper.findUnprocessed();
    }

    @Override
    public void markProcessed(String eventId) {
        stageEventMapper.markProcessed(eventId);
    }
}
