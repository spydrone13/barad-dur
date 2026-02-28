package com.spydrone.baraddur.repository;

import com.spydrone.baraddur.model.Lot;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface LotMapper {
    List<Lot> findAll();
    List<Lot> findByStage(String stage);
    List<Lot> findByOrderId(String orderId);
    List<Lot> findByStatus(String status);
    Lot findById(String id);
    void save(Lot lot);
}
