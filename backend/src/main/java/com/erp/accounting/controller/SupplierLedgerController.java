package com.erp.accounting.controller;

import com.erp.accounting.model.SupplierLedger;
import com.erp.accounting.service.SupplierLedgerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/supplier-ledgers")
@CrossOrigin(origins = "*")
public class SupplierLedgerController {
    
    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(SupplierLedgerController.class);

    @Autowired 
    private SupplierLedgerService service;

    @GetMapping
    public List<SupplierLedger> getAll(@RequestHeader(value = "X-Financial-Year", required = false) String financialYear) {
        logger.info("Fetching all ledgers for FY: {}", financialYear);
        return service.getAll(financialYear);
    }

    @PostMapping
    public SupplierLedger create(@RequestBody SupplierLedger ledger, @RequestHeader(value = "X-Financial-Year", required = false) String financialYear) {
        logger.info("Creating ledger: {} for FY: {}", ledger.getSupplierName(), financialYear);
        if (financialYear != null) {
            ledger.setFinancialYearId(financialYear);
        }
        return service.save(ledger, ledger.getFinancialYearId());
    }

    @PutMapping("/{id}")
    public SupplierLedger update(@PathVariable Long id, @RequestBody SupplierLedger ledger, @RequestHeader(value = "X-Financial-Year", required = false) String financialYear) {
        logger.info("Updating ledger ID: {} for FY: {}", id, financialYear);
        ledger.setId(id);
        if (financialYear != null) {
            ledger.setFinancialYearId(financialYear);
        }
        return service.save(ledger, ledger.getFinancialYearId());
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
