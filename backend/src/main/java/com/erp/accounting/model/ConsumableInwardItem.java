package com.erp.accounting.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class ConsumableInwardItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String itemDescription;
    private String unit;
    private Double quantity;
    private Double rate;
    private Double amount;
}
