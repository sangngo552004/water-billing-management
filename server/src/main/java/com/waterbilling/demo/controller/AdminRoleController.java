package com.waterbilling.demo.controller;

import com.waterbilling.demo.model.Role;
import com.waterbilling.demo.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/role")
@PreAuthorize("hasRole('admin')")
public class AdminRoleController {

    @Autowired
    private RoleService roleService;

    @GetMapping
    public ResponseEntity<List<Role>> getAll() {
        return ResponseEntity.ok(roleService.getAllRole());
    }
}
