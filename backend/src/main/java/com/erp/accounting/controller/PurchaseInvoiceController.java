package com.erp.accounting.controller;

import com.erp.accounting.model.PurchaseInvoice;
import com.erp.accounting.service.PurchaseInvoiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/purchase-invoices")
@CrossOrigin(origins = "*")
public class PurchaseInvoiceController {

    @Autowired
    private PurchaseInvoiceService purchaseInvoiceService;

    @GetMapping
    public List<PurchaseInvoice> getAll() {
        return purchaseInvoiceService.getAllPurchaseInvoices();
    }

    @PostMapping
    public PurchaseInvoice create(@RequestBody PurchaseInvoice invoice) {
        return purchaseInvoiceService.savePurchaseInvoice(invoice);
    }
}
