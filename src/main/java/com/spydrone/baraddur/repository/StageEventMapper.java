package com.spydrone.baraddur.repository;

import com.spydrone.baraddur.model.LotStageEvent;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface StageEventMapper {
    List<LotStageEvent> findUnprocessed();
    void markProcessed(String eventId);
}
