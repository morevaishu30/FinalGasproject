package com.erp.accounting.controller;

import com.erp.accounting.model.MaterialOutwardGDA;
import com.erp.accounting.repository.MaterialOutwardGDARepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/material-outward-gda")
@CrossOrigin(origins = "*")
public class MaterialOutwardGDAController {

    @Autowired
    private MaterialOutwardGDARepository repository;

    @GetMapping
    public List<MaterialOutwardGDA> getAll(@RequestHeader(value = "X-Financial-Year", required = false) String financialYear) {
        return repository.findAll();
    }

    @PostMapping
    public MaterialOutwardGDA create(@RequestBody MaterialOutwardGDA data, @RequestHeader(value = "X-Financial-Year", required = false) String financialYear) {
        if (financialYear != null) data.setFinancialYearId(financialYear);
        return repository.save(data);
    }
}
