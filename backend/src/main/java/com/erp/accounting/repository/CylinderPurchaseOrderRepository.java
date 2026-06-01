package com.erp.accounting.repository;

import com.erp.accounting.model.CylinderPurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface CylinderPurchaseOrderRepository extends JpaRepository<CylinderPurchaseOrder, Long> {
    List<CylinderPurchaseOrder> findByCustomerName(String customerName);

    @Query("SELECT MAX(c.entryNo) FROM CylinderPurchaseOrder c")
    Optional<String> findMaxEntryNo();

    @Query("SELECT MAX(c.supplierOrderNo) FROM CylinderPurchaseOrder c")
    Optional<String> findMaxSupplierOrderNo();
}
