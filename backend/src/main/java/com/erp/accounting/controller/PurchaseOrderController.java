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
    public List<PurchaseOrder> getAll(@RequestHeader(value = "X-Financial-Year", required = false) String financialYear) {
        if (financialYear == null || financialYear.trim().isEmpty()) return repository.findAll();
        return repository.findAllByFinancialYearId(financialYear);
    }

    @GetMapping("/next-entry-no")
    public Map<String, String> getNextEntryNo(@RequestHeader(value = "X-Financial-Year", required = false) String financialYear) {
        String fy = (financialYear != null && !financialYear.trim().isEmpty()) ? financialYear : "2025-2026";
        return Map.of(
            "entryNo", service.generateNextEntryNo(fy),
            "supplierOrderNo", service.generateNextSupplierOrderNo(fy)
        );
    }

    @PostMapping
    public PurchaseOrder create(@RequestBody PurchaseOrder order, @RequestHeader(value = "X-Financial-Year", required = false) String financialYear) {
        if (financialYear != null && !financialYear.trim().isEmpty()) {
            order.setFinancialYearId(financialYear);
        } else if (order.getFinancialYearId() == null || order.getFinancialYearId().trim().isEmpty()) {
            order.setFinancialYearId("2025-2026");
        }
        if (order.getEntryNo() == null || order.getEntryNo().isEmpty()) {
            order.setEntryNo(service.generateNextEntryNo(order.getFinancialYearId()));
        }
        return service.save(order);
    }

    @GetMapping("/{id}")
    public PurchaseOrder getById(@PathVariable Long id) {
        return repository.findById(id).orElse(null);
    }
}
