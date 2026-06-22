package com.erp.accounting.repository;

import com.erp.accounting.model.MaterialPurchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

@Repository
public interface MaterialPurchaseRepository extends JpaRepository<MaterialPurchase, Long> {

    @Query("SELECT m FROM MaterialPurchase m WHERE m.supplierName = :supplierName AND (m.paidAmount IS NULL OR m.paidAmount < m.netTotal)")
    List<MaterialPurchase> findOutstandingBySupplierName(@Param("supplierName") String supplierName);
}
