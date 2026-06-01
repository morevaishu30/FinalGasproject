package com.erp.accounting.controller;

import com.erp.accounting.model.MaterialInwardFTM;
import com.erp.accounting.repository.MaterialInwardFTMRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/material-inward-ftm")
@CrossOrigin(origins = "*")
public class MaterialInwardFTMController {

    @Autowired
    private MaterialInwardFTMRepository repository;

    @GetMapping
    public List<MaterialInwardFTM> getAll(@RequestHeader(value = "X-Financial-Year", required = false) String financialYear) {
        return repository.findAll();
    }

    @PostMapping
    public MaterialInwardFTM create(@RequestBody MaterialInwardFTM data, @RequestHeader(value = "X-Financial-Year", required = false) String financialYear) {
        if (financialYear != null) data.setFinancialYearId(financialYear);
        return repository.save(data);
    }
}
