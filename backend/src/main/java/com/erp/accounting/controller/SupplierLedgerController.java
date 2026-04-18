package com.erp.accounting.controller;

import com.erp.accounting.model.SupplierLedger;
import com.erp.accounting.repository.SupplierLedgerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/supplier-ledgers")
public class SupplierLedgerController {
    @Autowired private SupplierLedgerRepository repository;

    @GetMapping
    public List<SupplierLedger> getAll(@RequestHeader(value = "X-Financial-Year", required = false) String financialYear) {
        if (financialYear == null) return repository.findAll();
        return repository.findAllByFinancialYearId(financialYear);
    }

    @PostMapping
    public SupplierLedger create(@RequestBody SupplierLedger ledger, @RequestHeader("X-Financial-Year") String financialYear) {
        ledger.setFinancialYearId(financialYear);
        return repository.save(ledger);
    }
}
