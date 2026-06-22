package com.erp.accounting.service;

import com.erp.accounting.model.PurchaseInvoice;
import com.erp.accounting.repository.PurchaseInvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PurchaseInvoiceService {

    @Autowired
    private PurchaseInvoiceRepository purchaseInvoiceRepository;

    public List<PurchaseInvoice> getAllPurchaseInvoices() {
        return purchaseInvoiceRepository.findAll();
    }

    public PurchaseInvoice savePurchaseInvoice(PurchaseInvoice invoice) {
        return purchaseInvoiceRepository.save(invoice);
    }

    public PurchaseInvoice getPurchaseInvoiceById(Long id) {
        return purchaseInvoiceRepository.findById(id).orElse(null);
    }
}
