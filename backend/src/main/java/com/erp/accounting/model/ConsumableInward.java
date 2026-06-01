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
public class ConsumableInward extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String inwardNo;
    private LocalDate entryDate;
    private String partyName;
    private String location;
    private String challanNo;
    private LocalDate challanDate;
    private String vehicleNo;
    private String remark;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "consumable_inward_id")
    private List<ConsumableInwardItem> items = new ArrayList<>();
}
