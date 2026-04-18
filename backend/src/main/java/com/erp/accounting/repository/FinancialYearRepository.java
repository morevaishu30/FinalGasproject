package com.erp.accounting.repository;

import com.erp.accounting.model.FinancialYear;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface FinancialYearRepository extends JpaRepository<FinancialYear, Long> {
    Optional<FinancialYear> findByYearRange(String yearRange);
}
