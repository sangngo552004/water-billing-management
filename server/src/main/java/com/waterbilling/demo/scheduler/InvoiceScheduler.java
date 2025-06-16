package com.waterbilling.demo.scheduler;

import com.waterbilling.demo.service.InvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class InvoiceScheduler {

    @Autowired
    private InvoiceService invoiceService;


    @Scheduled(cron = "0 0 2 * * ?") // 2:00 AM mỗi ngày
    public void updateOverdueInvoicesScheduled() {
        invoiceService.updateOverdueInvoices();
    }


}
