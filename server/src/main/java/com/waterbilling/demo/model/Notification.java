package com.waterbilling.demo.model;

import com.waterbilling.demo.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

// --- Notification ---
@Entity
@Table(name = "Notification")
public class Notification {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "NotificationId")
    private Long notificationId;

    @Column(name = "Title", nullable = false, length = 255)
    private String title;

    @Column(name = "Content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ContractId")
    private Contract contract;

    @Enumerated(EnumType.STRING)
    @Column(name = "NotificationType")
    private NotificationType notificationType;

    @Column(name = "CreatedAt", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "IsRead", nullable = false)
    private Boolean isRead = false;


    // Getters and Setters
    public Long getNotificationId() { return notificationId; }
    public void setNotificationId(Long notificationId) { this.notificationId = notificationId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Contract getContract() { return contract; }
    public void setContract(Contract contract) { this.contract = contract; }
    public NotificationType getNotificationType() { return notificationType; }
    public void setNotificationType(NotificationType notificationType) { this.notificationType = notificationType; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean read) { isRead = read; }
}
