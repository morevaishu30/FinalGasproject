package com.erp.accounting.controller;

import com.erp.accounting.model.CustomerLedger;
import com.erp.accounting.repository.CustomerLedgerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer-ledgers")
@CrossOrigin(origins = "*")
public class CustomerLedgerController {

    @Autowired
    private CustomerLedgerRepository repository;

    @GetMapping
    public List<CustomerLedger> getAll(@RequestHeader(value = "X-Financial-Year", required = false) String financialYear) {
        if (financialYear == null || financialYear.trim().isEmpty()) return repository.findAll();
        return repository.findAllByFinancialYearId(financialYear);
    }

    @PostMapping
    public CustomerLedger create(@RequestBody CustomerLedger ledger, @RequestHeader(value = "X-Financial-Year", required = false) String financialYear) {
        if (financialYear != null && !financialYear.trim().isEmpty()) {
            ledger.setFinancialYearId(financialYear);
        } else if (ledger.getFinancialYearId() == null || ledger.getFinancialYearId().trim().isEmpty()) {
            ledger.setFinancialYearId("2025-2026");
        }
        return repository.save(ledger);
    }

    @PutMapping("/{id}")
    public CustomerLedger update(@PathVariable Long id, @RequestBody CustomerLedger ledger, @RequestHeader(value = "X-Financial-Year", required = false) String financialYear) {
        ledger.setId(id);
        if (financialYear != null && !financialYear.trim().isEmpty()) {
            ledger.setFinancialYearId(financialYear);
        } else if (ledger.getFinancialYearId() == null || ledger.getFinancialYearId().trim().isEmpty()) {
            ledger.setFinancialYearId("2025-2026");
        }
        return repository.save(ledger);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
