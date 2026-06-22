package com.erp.accounting.controller;

import com.erp.accounting.model.PurchaseOrder;
import com.erp.accounting.repository.PurchaseOrderRepository;
import com.erp.accounting.service.PurchaseOrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/purchase-orders")
@CrossOrigin(origins = "*")
public class PurchaseOrderController {

    @Autowired
    private PurchaseOrderService service;

    @Autowired
    private PurchaseOrderRepository repository;

    @GetMapping
    public List<PurchaseOrder> getAll(@RequestHeader("X-Financial-Year") String financialYear) {
        return repository.findAllByFinancialYearId(financialYear);
    }

    @GetMapping("/next-entry-no")
    public Map<String, String> getNextEntryNo(@RequestHeader(value = "X-Financial-Year", required = false) String financialYear) {
        return Map.of(
            "entryNo", service.generateNextEntryNo(financialYear),
            "supplierOrderNo", service.generateNextSupplierOrderNo(financialYear)
        );
    }

    @PostMapping
    public PurchaseOrder create(@RequestBody PurchaseOrder order, @RequestHeader("X-Financial-Year") String financialYear) {
        order.setFinancialYearId(financialYear);
        if (order.getEntryNo() == null || order.getEntryNo().isEmpty()) {
            order.setEntryNo(service.generateNextEntryNo(financialYear));
        }
        return service.save(order);
    }

    @GetMapping("/{id}")
    public PurchaseOrder getById(@PathVariable Long id) {
        return repository.findById(id).orElse(null);
    }
}
