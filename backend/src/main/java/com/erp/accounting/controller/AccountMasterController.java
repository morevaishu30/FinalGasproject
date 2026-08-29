package com.erp.accounting.controller;

import com.erp.accounting.model.AccountMaster;
import com.erp.accounting.repository.AccountMasterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/account-masters")
@CrossOrigin(origins = "*")
public class AccountMasterController {
    @Autowired private AccountMasterRepository repository;

    @GetMapping
    public List<AccountMaster> getAll(@RequestHeader(value = "X-Financial-Year", required = false) String financialYear) {
        if (financialYear == null || financialYear.trim().isEmpty()) return repository.findAll();
        return repository.findAllByFinancialYearId(financialYear);
    }

    @PostMapping
    public AccountMaster create(@RequestBody AccountMaster master, @RequestHeader(value = "X-Financial-Year", required = false) String financialYear) {
        if (financialYear != null && !financialYear.trim().isEmpty()) {
            master.setFinancialYearId(financialYear);
        } else if (master.getFinancialYearId() == null || master.getFinancialYearId().trim().isEmpty()) {
            master.setFinancialYearId("2025-2026");
        }
        return repository.save(master);
    }
}
