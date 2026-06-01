package com.erp.accounting.repository;

import com.erp.accounting.model.DocumentSequence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DocumentSequenceRepository extends JpaRepository<DocumentSequence, String> {
}
