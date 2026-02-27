package com.spydrone.baraddur.repository;

import com.spydrone.baraddur.dto.WeeklyTotalRow;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface WeeklyTotalsMapper {
    List<WeeklyTotalRow> findAll();
    void upsertCell(@Param("weekLabel")  String weekLabel,
                    @Param("stage")      String stage,
                    @Param("waferCount") int waferCount,
                    @Param("lotCount")   int lotCount,
                    @Param("orderCount") int orderCount);
    void adjustCell(@Param("weekLabel")   String weekLabel,
                    @Param("stage")       String stage,
                    @Param("waferDelta")  int waferDelta,
                    @Param("lotDelta")    int lotDelta,
                    @Param("orderDelta")  int orderDelta);
}
