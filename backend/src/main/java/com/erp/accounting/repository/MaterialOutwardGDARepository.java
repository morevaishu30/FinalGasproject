package com.erp.accounting.repository;

import com.erp.accounting.model.MaterialOutwardGDA;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaterialOutwardGDARepository extends JpaRepository<MaterialOutwardGDA, Long> {
}
