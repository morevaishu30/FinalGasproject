package com.erp.accounting.controller;

import com.erp.accounting.model.MaterialInwardECR;
import com.erp.accounting.repository.MaterialInwardECRRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/material-inward-ecr")
@CrossOrigin(origins = "*")
public class MaterialInwardECRController {

    @Autowired
    private MaterialInwardECRRepository repository;

    @GetMapping
    public List<MaterialInwardECR> getAll(@RequestHeader(value = "X-Financial-Year", required = false) String financialYear) {
        return repository.findAll();
    }

    @PostMapping
    public MaterialInwardECR create(@RequestBody MaterialInwardECR data, @RequestHeader(value = "X-Financial-Year", required = false) String financialYear) {
        if (financialYear != null) data.setFinancialYearId(financialYear);
        return repository.save(data);
    }
}
