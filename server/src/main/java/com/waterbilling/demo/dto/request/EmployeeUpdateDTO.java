package com.waterbilling.demo.dto.request;


import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class EmployeeUpdateDTO {
    @NotBlank @Size(max = 100)
    private String fullName;
    @NotBlank @Size(max = 15) @Pattern(regexp = "^[0-9]{10,15}$")
    private String phoneNumber;
    @NotBlank @Email @Size(max = 50)
    private String email;
    @NotNull
    private Boolean isActive;
    @NotNull
    private Long roleId;

    @Size(min = 8, max = 255)
    private String newPassword;

}
