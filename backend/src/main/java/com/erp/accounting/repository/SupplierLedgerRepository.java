package com.erp.accounting.repository;

import com.erp.accounting.model.SupplierLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SupplierLedgerRepository extends JpaRepository<SupplierLedger, Long> {
    List<SupplierLedger> findAllByFinancialYearId(String financialYearId);
}
