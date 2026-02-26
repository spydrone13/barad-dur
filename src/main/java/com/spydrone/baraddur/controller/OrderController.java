package com.spydrone.baraddur.controller;

import com.spydrone.baraddur.dto.OrderResponse;
import com.spydrone.baraddur.service.LotService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class OrderController {

    private final LotService lotService;

    public OrderController(LotService lotService) {
        this.lotService = lotService;
    }

    @GetMapping("/orders")
    public List<OrderResponse> getOrders() {
        return lotService.getOrders();
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<OrderResponse> getOrder(@PathVariable String id) {
        return lotService.getOrder(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
