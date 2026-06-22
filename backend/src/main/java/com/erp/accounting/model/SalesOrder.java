package com.erp.accounting.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@Table(name = "sales_orders")
public class SalesOrder extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String orderNo;
    private LocalDate orderDate;
    private String customerName;
    private String customerLocation;
    @Column(length = 500)
    private String customerAddress;
    private String consigneeName;
    private String consigneeLocation;
    @Column(length = 500)
    private String consigneeAddress;
    private String salesPerson;
    private String orderType;
    private String taxType;
    private String quotationNo;
    private LocalDate quotationDate;
    private Boolean ldApplicable;
    private String ldOn;
    private Double ldRate;
    private Double extraForAmt;
    private Double transportation;
    private Double grossTotal;
    private Double discount;
    private Double netTotal;
    @Column(length = 1000)
    private String notes;
    @Column(length = 1000)
    private String terms;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "sales_order_id")
    private List<SalesOrderItem> items = new ArrayList<>();
}
