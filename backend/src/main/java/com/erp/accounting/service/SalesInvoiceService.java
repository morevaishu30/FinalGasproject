package com.erp.accounting.service;

import com.erp.accounting.model.SalesInvoice;
import com.erp.accounting.repository.SalesInvoiceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SalesInvoiceService {

    @Autowired
    private SalesInvoiceRepository repository;

    public List<SalesInvoice> getAll() {
        return repository.findAll();
    }

    public SalesInvoice getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public SalesInvoice save(SalesInvoice salesInvoice) {
        return repository.save(salesInvoice);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
