package com.waterbilling.demo.service;

import com.waterbilling.demo.model.Role;
import com.waterbilling.demo.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RoleService {

    @Autowired
    private RoleRepository roleRepository;

    public List<Role> getAllRole(){
        return roleRepository.findAll();
    }
}
