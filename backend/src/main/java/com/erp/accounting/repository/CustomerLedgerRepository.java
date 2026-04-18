package com.erp.accounting.repository;

import com.erp.accounting.model.CustomerLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CustomerLedgerRepository extends JpaRepository<CustomerLedger, Long> {
    List<CustomerLedger> findAllByFinancialYearId(String financialYearId);
}
