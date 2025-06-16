package com.waterbilling.demo.model;
import jakarta.persistence.*;
import java.time.LocalDateTime;
// --- ChangeInfoRequest ---
@Entity
@Table(name = "ChangeInfoRequest")
@PrimaryKeyJoinColumn(name = "RequestId") // This links its primary key to the Request table's primary key
public class ChangeInfoRequest extends Request {
    @Column(name = "OldFullName", length = 100)
    private String oldFullName;

    @Column(name = "OldEmail", length = 100)
    private String oldEmail;

    @Column(name = "OldPhoneNumber", length = 15)
    private String oldPhoneNumber;

    @Column(name = "NewFullName", length = 100)
    private String newFullName;

    @Column(name = "NewEmail", length = 100)
    private String newEmail;

    @Column(name = "NewPhoneNumber", length = 15)
    private String newPhoneNumber;

    // Getters and Setters
    public String getOldFullName() { return oldFullName; }
    public void setOldFullName(String oldFullName) { this.oldFullName = oldFullName; }
    public String getOldEmail() { return oldEmail; }
    public void setOldEmail(String oldEmail) { this.oldEmail = oldEmail; }
    public String getOldPhoneNumber() { return oldPhoneNumber; }
    public void setOldPhoneNumber(String oldPhoneNumber) { this.oldPhoneNumber = oldPhoneNumber; }
    public String getNewFullName() { return newFullName; }
    public void setNewFullName(String newFullName) { this.newFullName = newFullName; }
    public String getNewEmail() { return newEmail; }
    public void setNewEmail(String newEmail) { this.newEmail = newEmail; }
    public String getNewPhoneNumber() { return newPhoneNumber; }
    public void setNewPhoneNumber(String newPhoneNumber) { this.newPhoneNumber = newPhoneNumber; }
}
