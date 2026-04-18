package com.erp.accounting.repository;

import com.erp.accounting.model.ItemMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ItemMasterRepository extends JpaRepository<ItemMaster, Long> {
    List<ItemMaster> findAllByFinancialYearId(String financialYearId);
}
