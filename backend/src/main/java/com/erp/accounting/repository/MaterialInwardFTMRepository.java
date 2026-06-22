package com.erp.accounting.repository;

import com.erp.accounting.model.MaterialInwardFTM;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MaterialInwardFTMRepository extends JpaRepository<MaterialInwardFTM, Long> {
}
