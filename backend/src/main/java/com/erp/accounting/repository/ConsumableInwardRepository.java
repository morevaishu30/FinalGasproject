package com.erp.accounting.repository;

import com.erp.accounting.model.ConsumableInward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConsumableInwardRepository extends JpaRepository<ConsumableInward, Long> {
}
