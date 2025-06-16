package com.waterbilling.demo.controller;

import com.waterbilling.demo.dto.response.WaterMeterAssignmentDTO;
import com.waterbilling.demo.service.WaterMeterAssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/admin/assignments/")
@PreAuthorize("hasRole('admin')")
public class AdminWaterMeterAssignmentController {

    @Autowired
    private WaterMeterAssignmentService waterMeterAssignmentService;
    @PutMapping("/{assignmentId}/deactivate")
    public ResponseEntity<WaterMeterAssignmentDTO> deactivateWaterMeterAssignment(@PathVariable Long assignmentId) {
        WaterMeterAssignmentDTO deactivatedAssignment = waterMeterAssignmentService.deactivateWaterMeterAssignment(assignmentId);
        return ResponseEntity.ok(deactivatedAssignment);
    }

}
