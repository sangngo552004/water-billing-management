package com.waterbilling.demo.dto.response;

public class ChangeInfoRequestDTO {

    private String oldFullName;
    private String newFullName;
    private String oldEmail;
    private String newEmail;
    private String oldPhoneNumber;
    private String newPhoneNumber;

    public String getOldFullName() {
        return oldFullName;
    }

    public void setOldFullName(String oldFullName) {
        this.oldFullName = oldFullName;
    }

    public String getNewFullName() {
        return newFullName;
    }

    public void setNewFullName(String newFullName) {
        this.newFullName = newFullName;
    }

    public String getOldEmail() {
        return oldEmail;
    }

    public void setOldEmail(String oldEmail) {
        this.oldEmail = oldEmail;
    }

    public String getNewEmail() {
        return newEmail;
    }

    public void setNewEmail(String newEmail) {
        this.newEmail = newEmail;
    }

    public String getNewPhoneNumber  () {
        return newPhoneNumber;
    }

    public void setNewPhoneNumber(String newPhoneNumber) {
        this.newPhoneNumber = newPhoneNumber;
    }

    public String getOldPhoneNumber() {
        return oldPhoneNumber;
    }

    public void setOldPhoneNumber(String oldPhoneNumber) {
        this.oldPhoneNumber = oldPhoneNumber;
    }
}
