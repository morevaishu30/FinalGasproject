package com.erp.accounting.repository;

import com.erp.accounting.model.SupplierLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface SupplierLedgerRepository extends JpaRepository<SupplierLedger, Long> {
    @Query("SELECT s FROM SupplierLedger s WHERE s.financialYearId = :financialYearId OR s.financialYearId IS NULL")
    List<SupplierLedger> findAllByFinancialYearId(@Param("financialYearId") String financialYearId);
}
