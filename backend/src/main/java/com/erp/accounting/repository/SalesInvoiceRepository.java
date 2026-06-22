package com.erp.accounting.repository;

import com.erp.accounting.model.SalesInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

@Repository
public interface SalesInvoiceRepository extends JpaRepository<SalesInvoice, Long> {

    @Query("SELECT s FROM SalesInvoice s WHERE s.customerName = :customerName AND (s.paidAmount IS NULL OR s.paidAmount < s.netTotal)")
    List<SalesInvoice> findOutstandingByCustomerName(@Param("customerName") String customerName);
}
