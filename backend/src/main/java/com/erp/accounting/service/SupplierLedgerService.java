package com.erp.accounting.service;

import com.erp.accounting.model.SupplierLedger;
import com.erp.accounting.repository.SupplierLedgerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class SupplierLedgerService {

    @Autowired
    private SupplierLedgerRepository repository;

    public List<SupplierLedger> getAll(String financialYearId) {
        if (financialYearId != null) {
            return repository.findAllByFinancialYearId(financialYearId);
        }
        return repository.findAll();
    }

    public SupplierLedger save(SupplierLedger ledger, String financialYearId) {
        ledger.setFinancialYearId(financialYearId);
        return repository.save(ledger);
    }

    public Optional<SupplierLedger> getById(Long id) {
        return repository.findById(id);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
