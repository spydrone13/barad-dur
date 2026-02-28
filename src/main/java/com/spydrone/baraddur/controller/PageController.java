package com.spydrone.baraddur.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PageController {

    @GetMapping("/weekly")
    public String weekly() {
        return "forward:/index.html";
    }
}
