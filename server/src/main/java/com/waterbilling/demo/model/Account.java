package com.waterbilling.demo.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;



@Entity
@Table(name = "Account")
public class Account {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "AccountId")
    private Long accountId;

    @Column(name = "Username", nullable = false, length = 50, unique = true)
    private String username;

    @Column(name = "Password", nullable = false, length = 255)
    private String password;

    @Column(name = "CreatedAt", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "RoleId", nullable = false)
    private Role role;

    @Column(name = "IsActive", nullable = false)
    private Boolean isActive = true;

    // Getters and Setters
    public Long getAccountId() { return accountId; }
    public void setAccountId(Long accountId) { this.accountId = accountId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public Boolean getIsActive() { return isActive; }
    public void setIsActive(Boolean active) { isActive = active; }
}
