package com.waterbilling.demo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RevenueByPeriodDTO {
    private Long periodId;
    private String periodName;
    private LocalDate fromDate;
    private LocalDate toDate;
    private BigDecimal totalRevenue;
}
