package com.erp.accounting.controller;

import com.erp.accounting.model.SalesOrder;
import com.erp.accounting.repository.SalesOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales-orders")
@CrossOrigin(origins = "*")
public class SalesOrderController {

    @Autowired
    private SalesOrderRepository repository;

    @GetMapping
    public List<SalesOrder> getAll(@RequestHeader(value = "X-Financial-Year", required = false) String financialYear) {
        return repository.findAll();
    }

    @PostMapping
    public SalesOrder create(@RequestBody SalesOrder data, @RequestHeader(value = "X-Financial-Year", required = false) String financialYear) {
        if (financialYear != null) data.setFinancialYearId(financialYear);
        return repository.save(data);
    }
}
