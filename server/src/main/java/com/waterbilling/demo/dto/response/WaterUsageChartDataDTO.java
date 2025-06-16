package com.waterbilling.demo.dto.response;

import java.math.BigDecimal;
import java.util.List;

public class WaterUsageChartDataDTO {


    private int year;
    private BigDecimal totalUsageForYear;
    private List<WaterUsageByPeriodDTO> usageByPeriods;

    // Getters and Setters
    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }
    public BigDecimal getTotalUsageForYear() { return totalUsageForYear; }
    public void setTotalUsageForYear(BigDecimal totalUsageForYear) { this.totalUsageForYear = totalUsageForYear; }
    public List<WaterUsageByPeriodDTO> getUsageByPeriods() { return usageByPeriods; }
    public void setUsageByPeriods(List<WaterUsageByPeriodDTO> usageByPeriods) { this.usageByPeriods = usageByPeriods; }
}