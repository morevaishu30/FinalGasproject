package com.erp.accounting.repository;

import com.erp.accounting.model.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    List<PurchaseOrder> findAllByFinancialYearId(String financialYearId);

    @Query("SELECT MAX(p.entryNo) FROM PurchaseOrder p WHERE p.financialYearId = :fyId")
    Optional<String> findMaxEntryNo(@Param("fyId") String fyId);

    @Query("SELECT MAX(p.supplierOrderNo) FROM PurchaseOrder p WHERE p.financialYearId = :fyId")
    Optional<String> findMaxSupplierOrderNo(@Param("fyId") String fyId);
}
