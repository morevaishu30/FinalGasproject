package com.erp.accounting.controller;

import com.erp.accounting.model.MaterialPurchase;
import com.erp.accounting.repository.MaterialPurchaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/material-purchases")
@CrossOrigin(origins = "*")
public class MaterialPurchaseController {

    @Autowired
    private MaterialPurchaseRepository repository;

    @GetMapping
    public List<MaterialPurchase> getAll(@RequestHeader(value = "X-Financial-Year", required = false) String financialYear) {
        return repository.findAll();
    }

    @PostMapping
    public MaterialPurchase create(@RequestBody MaterialPurchase data, @RequestHeader(value = "X-Financial-Year", required = false) String financialYear) {
        if (financialYear != null) data.setFinancialYearId(financialYear);
        return repository.save(data);
    }
}
