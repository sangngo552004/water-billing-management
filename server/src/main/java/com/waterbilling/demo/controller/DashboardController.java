package com.waterbilling.demo.controller;

import com.waterbilling.demo.dto.response.DashboardSummaryDTO;
import com.waterbilling.demo.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
public class DashboardController {

    @Autowired
    private  DashboardService dashboardService;


    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryDTO> getDashboardSummary(@RequestParam(required = false) Integer year) {
        DashboardSummaryDTO summary = dashboardService.getDashboardSummary(year);
        return ResponseEntity.ok(summary);
    }
}
