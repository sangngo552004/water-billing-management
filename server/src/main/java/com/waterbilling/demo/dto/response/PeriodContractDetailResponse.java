package com.waterbilling.demo.dto.response;

import com.waterbilling.demo.enums.PeriodContractStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PeriodContractDetailResponse {
    private Long contractPeriodId;
    private Long periodId;
    private String periodName;
    private Long contractId;
    private String customerCode;
    private String ownerFullName;
    private String facilityAddress;
    private PeriodContractStatus status;
    private String note;
    private List<WaterMeterAssignmentDTO> waterMeterAssignments; // Danh sách đồng hồ được gán
    private List<WaterMeterReadingDTO> waterMeterReadings; // Danh sách các bản ghi đọc nước của kỳ này
}
