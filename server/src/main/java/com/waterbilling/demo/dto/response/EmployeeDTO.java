package com.waterbilling.demo.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class EmployeeDTO { // For returning Employee details
    private Long employeeId;
    private String username;
    private String fullName;
    private String phoneNumber;
    private String email;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private Long roleId;

}
