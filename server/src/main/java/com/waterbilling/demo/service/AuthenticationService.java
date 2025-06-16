package com.waterbilling.demo.service;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.waterbilling.demo.dto.request.AuthenticationRequest;
import com.waterbilling.demo.dto.request.IntrospectRequest;
import com.waterbilling.demo.dto.request.LogoutRequest;
import com.waterbilling.demo.dto.request.RefreshRequest;
import com.waterbilling.demo.dto.response.AuthenticationResponse;
import com.waterbilling.demo.dto.response.IntrospectResponse;
import com.waterbilling.demo.exception.AppException;
import com.waterbilling.demo.exception.ErrorCode;
import com.waterbilling.demo.exception.ResourceNotFoundException;
import com.waterbilling.demo.exception.UnauthorizedAccessException;
import com.waterbilling.demo.model.Account;
import com.waterbilling.demo.model.InvalidatedToken;
import com.waterbilling.demo.model.Role;
import com.waterbilling.demo.repository.AccountRepository;
import com.waterbilling.demo.repository.InvalidatedTokenRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.StringJoiner;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AuthenticationService {

    AccountRepository accountRepository;

    InvalidatedTokenRepository invalidatedTokenRepository;


    @NonFinal
    @Value("${jwt.signerKey}")
    protected String SIGNER_KEY;

    @NonFinal
    @Value("${jwt.valid-duration}")
    protected long VALID_DURATION;

    @NonFinal
    @Value("${jwt.refreshable-duration}")
    protected long REFRESHABLE_DURATION;

    public IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException {
        var token = request.getToken();
        boolean isValid = true;

        try {
            verifyToken(token, false);
        } catch (AppException e) {
            isValid = false;
        }
        return IntrospectResponse.builder().valid(isValid).build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request) {

        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10);

        var account = accountRepository
                .findByUsername(request.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Tài khoản không tồn tại"));

        boolean authenticated = passwordEncoder.matches(request.getPassword(), account.getPassword());
        if(!authenticated) throw  new UnauthorizedAccessException("Mật khẩu bị sai.");
        if (!account.getIsActive()) throw new UnauthorizedAccessException("Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ admin.");

        var token = generateToken(account);

        return AuthenticationResponse.builder().
                token(token).
                authenticated(true)
                .accountId(account.getAccountId())
                .roleName(account.getRole().getRoleName())
                .build();
    }

    public void logout(LogoutRequest request) throws ParseException, JOSEException {
        try {
            var signToken = verifyToken(request.getToken(), true);

            String jit = signToken.getJWTClaimsSet().getJWTID();
            Date expiryTime = signToken.getJWTClaimsSet().getExpirationTime();

            InvalidatedToken invalidatedToken =
                    InvalidatedToken.builder().id(jit).expiryTime(expiryTime).build();

            invalidatedTokenRepository.save(invalidatedToken);
        } catch (AppException exception) {
            log.info("Token already expired");
        }
    }

    public AuthenticationResponse refreshToken(RefreshRequest request) throws ParseException, JOSEException {
        var signedJWT = verifyToken(request.getToken(), true);

        var jit = signedJWT.getJWTClaimsSet().getJWTID();
        var expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();

        InvalidatedToken invalidatedToken =
                InvalidatedToken.builder().id(jit).expiryTime(expiryTime).build();

        invalidatedTokenRepository.save(invalidatedToken);

        var username = signedJWT.getJWTClaimsSet().getSubject();

        var account =
                accountRepository.findByUsername(username).orElseThrow(() -> new UnauthorizedAccessException("You are not authorized"));

        var token = generateToken(account);

        return AuthenticationResponse.builder().token(token).authenticated(true).build();
    }

    private String generateToken(Account account) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(String.valueOf(account.getAccountId()))
                .issuer("waterbilling.com")
                .issueTime(new Date())
                .expirationTime(new Date(
                        Instant.now().plus(VALID_DURATION, ChronoUnit.SECONDS).toEpochMilli()))
                .jwtID(UUID.randomUUID().toString())
                .claim("scope", buildScope(account))
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());

        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(SIGNER_KEY.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException e) {
            log.error("Cannot create token", e);
            throw new RuntimeException(e);
        }
    }

    private SignedJWT verifyToken(String token, boolean isRefresh) throws JOSEException, ParseException {
        JWSVerifier verifier = new MACVerifier(SIGNER_KEY.getBytes());

        SignedJWT signedJWT = SignedJWT.parse(token);

        Date expiryTime = (isRefresh)
                ? new Date(signedJWT
                .getJWTClaimsSet()
                .getIssueTime()
                .toInstant()
                .plus(REFRESHABLE_DURATION, ChronoUnit.SECONDS)
                .toEpochMilli())
                : signedJWT.getJWTClaimsSet().getExpirationTime();

        var verified = signedJWT.verify(verifier);

        if (!(verified && expiryTime.after(new Date()))) throw new UnauthorizedAccessException("You are not authorized");

        if (invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID()))
            throw new UnauthorizedAccessException("You are not authorized");

        return signedJWT;
    }

    private String buildScope(Account account) {
        StringJoiner stringJoiner = new StringJoiner(" ");
        Role role = account.getRole();
        stringJoiner.add("ROLE_" + role.getRoleName());

        return stringJoiner.toString();
    }
}
