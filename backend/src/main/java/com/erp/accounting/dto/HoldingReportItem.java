package com.erp.accounting.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HoldingReportItem {
    private String partyName;
    private String itemDescription;
    private Double holdingQty;
}
