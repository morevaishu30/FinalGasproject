package com.erp.accounting.controller;

import com.erp.accounting.model.CustomerLedger;
import com.erp.accounting.repository.CustomerLedgerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer-ledgers")
public class CustomerLedgerController {

    @Autowired
    private CustomerLedgerRepository repository;

    @GetMapping
    public List<CustomerLedger> getAll(@RequestHeader(value = "X-Financial-Year", required = false) String financialYear) {
        if (financialYear == null) return repository.findAll();
        return repository.findAllByFinancialYearId(financialYear);
    }

    @PostMapping
    public CustomerLedger create(@RequestBody CustomerLedger ledger, @RequestHeader("X-Financial-Year") String financialYear) {
        ledger.setFinancialYearId(financialYear);
        return repository.save(ledger);
    }

    @PutMapping("/{id}")
    public CustomerLedger update(@PathVariable Long id, @RequestBody CustomerLedger ledger, @RequestHeader("X-Financial-Year") String financialYear) {
        ledger.setId(id);
        ledger.setFinancialYearId(financialYear);
        return repository.save(ledger);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
