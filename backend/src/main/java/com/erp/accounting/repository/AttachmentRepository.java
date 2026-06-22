package com.erp.accounting.repository;

import com.erp.accounting.model.Attachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findByReferenceTypeAndReferenceId(String referenceType, Long referenceId);
}
