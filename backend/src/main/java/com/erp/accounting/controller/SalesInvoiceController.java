package com.erp.accounting.controller;

import com.erp.accounting.model.SalesInvoice;
import com.erp.accounting.service.SalesInvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sales-invoices")
@CrossOrigin(origins = "*")
public class SalesInvoiceController {

    @Autowired
    private SalesInvoiceService service;

    @GetMapping
    public List<SalesInvoice> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<SalesInvoice> getById(@PathVariable Long id) {
        SalesInvoice salesInvoice = service.getById(id);
        return salesInvoice != null ? ResponseEntity.ok(salesInvoice) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public SalesInvoice create(@RequestBody SalesInvoice salesInvoice) {
        return service.save(salesInvoice);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SalesInvoice> update(@PathVariable Long id, @RequestBody SalesInvoice salesInvoice) {
        SalesInvoice existing = service.getById(id);
        if (existing == null) return ResponseEntity.notFound().build();
        salesInvoice.setId(id);
        return ResponseEntity.ok(service.save(salesInvoice));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/outstanding/customer/{customerName}")
    public List<SalesInvoice> getOutstandingByCustomer(@PathVariable String customerName) {
        return service.findOutstandingByCustomerName(customerName);
    }
}
