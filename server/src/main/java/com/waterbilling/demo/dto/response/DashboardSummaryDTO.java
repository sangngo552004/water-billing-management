package com.waterbilling.demo.dto.response;

import java.util.List;

@lombok.Getter
@lombok.Setter
@lombok.Builder
public class DashboardSummaryDTO {
    private long pendingRequestsCount;
    private long unconfirmedWaterReadingsCount;
    private long pendingInvoiceCreationCount;

    private String latestBillingPeriodName;
    private String latestBillingPeriodStatus;
    private String latestBillingPeriodFromDate;
    private String latestBillingPeriodToDate;

    private List<RevenueByPeriodDTO> revenueByPeriods;

}
