package com.spydrone.baraddur.repository;

import com.spydrone.baraddur.model.Lot;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public class MyBatisLotRepository implements LotRepository {

    private final LotMapper lotMapper;

    public MyBatisLotRepository(LotMapper lotMapper) {
        this.lotMapper = lotMapper;
    }

    @Override
    public List<Lot> findAll() {
        return lotMapper.findAll();
    }

    @Override
    public List<Lot> findByStage(String stage) {
        return lotMapper.findByStage(stage);
    }

    @Override
    public List<Lot> findByStatus(String status) {
        return lotMapper.findByStatus(status);
    }

    @Override
    public Optional<Lot> findById(String id) {
        return Optional.ofNullable(lotMapper.findById(id));
    }

    @Override
    public void save(Lot lot) {
        lotMapper.save(lot);
    }
}
