package com.erp.accounting.repository;

import com.erp.accounting.model.AccountMaster;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AccountMasterRepository extends JpaRepository<AccountMaster, Long> {
    List<AccountMaster> findAllByFinancialYearId(String financialYearId);
}
