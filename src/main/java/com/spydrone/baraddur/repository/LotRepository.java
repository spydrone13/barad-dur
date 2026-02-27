package com.spydrone.baraddur.repository;

import com.spydrone.baraddur.model.Lot;

import java.util.List;
import java.util.Optional;

public interface LotRepository {
    List<Lot> findAll();
    List<Lot> findByStage(String stage);
    List<Lot> findByStatus(String status);
    Optional<Lot> findById(String id);
    void save(Lot lot);
}
