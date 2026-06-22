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
@Table(name = "vouchers")
public class Voucher extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String voucherType; // "bank-receipt", "cash-receipt", "bank-payment", "cash-payment"
    private String book;
    private LocalDate voucherDate;
    private String voucherNo;
    private String partyName;
    @Column(length = 1000)
    private String remarks;

    private Double totalAmount;
    private Double totalAdjustedAmount;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "voucher_id")
    private List<VoucherParticular> particulars = new ArrayList<>();

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "voucher_id")
    private List<VoucherAdjustment> adjustments = new ArrayList<>();
}
