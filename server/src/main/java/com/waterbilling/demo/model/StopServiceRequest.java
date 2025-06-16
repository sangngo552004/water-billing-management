package com.waterbilling.demo.model;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "StopServiceRequest")
@PrimaryKeyJoinColumn(name = "RequestId")
public class StopServiceRequest extends Request {
    @Column(name = "Reason", nullable = false, columnDefinition = "TEXT")
    private String reason;

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
}
