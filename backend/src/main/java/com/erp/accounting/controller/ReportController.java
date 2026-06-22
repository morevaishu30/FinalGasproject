package com.erp.accounting.controller;

import com.erp.accounting.dto.StockReportItem;
import com.erp.accounting.dto.HoldingReportItem;
import com.erp.accounting.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/stock")
    public List<StockReportItem> getStockReport() {
        return reportService.getStockReport();
    }

    @GetMapping("/holding")
    public List<HoldingReportItem> getCylinderHoldingReport() {
        return reportService.getCylinderHoldingReport();
    }
}
