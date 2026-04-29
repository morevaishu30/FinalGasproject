package com.erp.accounting.repository;

import com.erp.accounting.model.CylinderMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CylinderMasterRepository extends JpaRepository<CylinderMaster, Long> {
    List<CylinderMaster> findByFinancialYearId(String financialYearId);
}
