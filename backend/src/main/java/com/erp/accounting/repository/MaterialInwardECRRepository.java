package com.erp.accounting.repository;

import com.erp.accounting.model.MaterialInwardECR;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaterialInwardECRRepository extends JpaRepository<MaterialInwardECR, Long> {
}
