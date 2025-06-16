package com.waterbilling.demo.model;

import jakarta.persistence.*;


// --- Role ---
@Entity
@Table(name = "Role")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "RoleId")
    private Long roleId;

    @Column(name = "RoleName", nullable = false, length = 100, unique = true)
    private String roleName;

    @Column(name = "Description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "IsActive", nullable = false)
    private Boolean isActive = true;

    // Getters and Setters
    public Long getRoleId() { return roleId; }
    public void setRoleId(Long roleId) { this.roleId = roleId; }
    public String getRoleName() { return roleName; }
    public void setRoleName(String roleName) { this.roleName = roleName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }
}
