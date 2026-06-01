package com.erp.accounting.repository;

import com.erp.accounting.model.MaterialPurchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaterialPurchaseRepository extends JpaRepository<MaterialPurchase, Long> {
}
