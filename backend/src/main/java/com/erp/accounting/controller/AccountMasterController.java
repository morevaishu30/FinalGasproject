package com.erp.accounting.controller;

import com.erp.accounting.model.AccountMaster;
import com.erp.accounting.repository.AccountMasterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/account-masters")
public class AccountMasterController {
    @Autowired private AccountMasterRepository repository;

    @GetMapping
    public List<AccountMaster> getAll(@RequestHeader(value = "X-Financial-Year", required = false) String financialYear) {
        if (financialYear == null) return repository.findAll();
        return repository.findAllByFinancialYearId(financialYear);
    }

    @PostMapping
    public AccountMaster create(@RequestBody AccountMaster master, @RequestHeader("X-Financial-Year") String financialYear) {
        master.setFinancialYearId(financialYear);
        return repository.save(master);
    }
}
