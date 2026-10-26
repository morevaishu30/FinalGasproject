package com.erp.accounting.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
@Table(name = "sales_invoice_items")
public class SalesInvoiceItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String itemDescription;
    private String unit;
    private Integer partyCyl;
    private Integer ourCyl;
    private Double capacity;
    private Double qty;
    private String ratePer; // Nos, etc.
    private Double rate;
    private Double amount;
    private String remark;
    private String hsn;
}
