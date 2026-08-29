package com.erp.accounting.repository;

import com.erp.accounting.model.CustomerLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CustomerLedgerRepository extends JpaRepository<CustomerLedger, Long> {
    @Query("SELECT c FROM CustomerLedger c WHERE c.financialYearId = :financialYearId OR c.financialYearId IS NULL")
    List<CustomerLedger> findAllByFinancialYearId(@Param("financialYearId") String financialYearId);
}
