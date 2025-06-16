package com.waterbilling.demo.controller;

import com.nimbusds.jose.JOSEException;
import com.waterbilling.demo.dto.request.*;
import com.waterbilling.demo.dto.response.ApiResponse;
import com.waterbilling.demo.dto.response.AuthenticationResponse;
import com.waterbilling.demo.dto.response.IntrospectResponse;
import com.waterbilling.demo.dto.response.OwnerRegisterResponseDTO;
import com.waterbilling.demo.service.AuthenticationService;
import com.waterbilling.demo.service.OwnerService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationController {

    AuthenticationService authenticationService;

    OwnerService ownerService;

    @PostMapping("/token")
    ApiResponse<AuthenticationResponse> authenticate(@Valid @RequestBody AuthenticationRequest request) {
        var result = authenticationService.authenticate(request);
        return ApiResponse.<AuthenticationResponse>builder().result(result).build();
    }

    @PostMapping("/introspect")
    ApiResponse<IntrospectResponse> authenticate(@RequestBody IntrospectRequest request)
            throws ParseException, JOSEException {
        var result = authenticationService.introspect(request);
        return ApiResponse.<IntrospectResponse>builder().result(result).build();
    }


    @PostMapping("/logout")
    ApiResponse<Void> logout(@RequestBody LogoutRequest request) throws ParseException, JOSEException {
        authenticationService.logout(request);
        return ApiResponse.<Void>builder().build();
    }

    @PostMapping("/register")
    public ApiResponse<OwnerRegisterResponseDTO> registerOwner(@Valid @RequestBody OwnerRegisterInputDTO registerDTO) {
        OwnerRegisterResponseDTO response = ownerService.registerOwner(registerDTO);
        return ApiResponse.<OwnerRegisterResponseDTO>builder().result(response).build();
    }
}
