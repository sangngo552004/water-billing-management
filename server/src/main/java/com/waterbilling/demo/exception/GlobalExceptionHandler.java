package com.waterbilling.demo.exception;


import com.waterbilling.demo.dto.response.ApiResponse;
import jakarta.validation.ConstraintViolation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    private static final String MIN_ATTRIBUTE = "min";


    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<ApiResponse> handleInvalidRequestException(InvalidRequestException ex) {
        ApiResponse response = new ApiResponse();
        response.setCode(4001);
        response.setMessage(ex.getMessage());
        return ResponseEntity.badRequest().body(response);
    }
    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiResponse> handleDuplicateResourceException(DuplicateResourceException ex) {
        ApiResponse response = new ApiResponse();
        response.setCode(4090);
        response.setMessage(ex.getMessage());
        return ResponseEntity.badRequest().body(response);
    }
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiResponse> handleResourceNotFoundException(ResourceNotFoundException ex) {
        ApiResponse response = new ApiResponse();
        response.setCode(4040);
        response.setMessage(ex.getMessage());
        return ResponseEntity.badRequest().body(response);
    }

    @ExceptionHandler(UnauthorizedAccessException.class)
    public ResponseEntity<ApiResponse> handleUnauthorizedAccessException(UnauthorizedAccessException ex) {
        ApiResponse response = new ApiResponse();
        response.setCode(4030);
        response.setMessage(ex.getMessage());
        return ResponseEntity.badRequest().body(response);
    }


    @ExceptionHandler(value = Exception.class)
    ResponseEntity<ApiResponse> handlingRuntimeException(RuntimeException exception) {
        log.error("Exception: ", exception);
        ApiResponse apiResponse = new ApiResponse();

        apiResponse.setCode(ErrorCode.UNCATEGORIZED_EXCEPTION.getCode());
        apiResponse.setMessage(ErrorCode.UNCATEGORIZED_EXCEPTION.getMessage());

        return ResponseEntity.badRequest().body(apiResponse);
    }

    @ExceptionHandler(value = AppException.class)
    ResponseEntity<ApiResponse> handlingAppException(AppException exception) {
        ErrorCode errorCode = exception.getErrorCode();
        ApiResponse apiResponse = new ApiResponse();

        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(errorCode.getMessage());

        return ResponseEntity.status(errorCode.getStatusCode()).body(apiResponse);
    }

//    @ExceptionHandler(value = AccessDeniedException.class)
//    ResponseEntity<ApiResponse> handlingAccessDeniedException(AccessDeniedException exception) {
//        ErrorCode errorCode = ErrorCode.UNAUTHORIZED;
//
//        return ResponseEntity.status(errorCode.getStatusCode())
//                .body(ApiResponse.builder()
//                        .code(errorCode.getCode())
//                        .message(errorCode.getMessage())
//                        .build());
//    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage()));
        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgumentException(IllegalArgumentException ex) {
        Map<String, String> error = new HashMap<>();
        error.put("error", ex.getMessage());
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<String> handleDataIntegrityViolation(DataIntegrityViolationException e) {
        // Có thể phân tích lỗi sâu hơn nếu cần
        return new ResponseEntity<>("Lỗi: Dữ liệu trùng lặp", HttpStatus.BAD_REQUEST);
    }
}
