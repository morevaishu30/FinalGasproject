package com.erp.accounting.controller;

import com.erp.accounting.model.FinancialYear;
import com.erp.accounting.repository.FinancialYearRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/financial-years")
public class FinancialYearController {

    @Autowired
    private FinancialYearRepository repository;

    @GetMapping
    public List<FinancialYear> getAll() {
        return repository.findAll();
    }

    @PostMapping
    public FinancialYear create(@RequestBody FinancialYear fy) {
        return repository.save(fy);
    }
}
