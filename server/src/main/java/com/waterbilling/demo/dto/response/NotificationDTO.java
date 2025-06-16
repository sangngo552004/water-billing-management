package com.waterbilling.demo.dto.response;

import com.waterbilling.demo.enums.NotificationType;

import java.time.LocalDateTime;

public class NotificationDTO {
    private Long notificationId;
    private String title;
    private String content;
    private NotificationType notificationType;
    private LocalDateTime createdAt;
    private Boolean isRead;

    // Getters and Setters
    public Long getNotificationId() { return notificationId; }
    public void setNotificationId(Long notificationId) { this.notificationId = notificationId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public NotificationType getNotificationType() { return notificationType; }
    public void setNotificationType(NotificationType notificationType) { this.notificationType = notificationType; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public Boolean getIsRead() { return isRead; }
    public void setIsRead(Boolean read) { isRead = read; }
}
