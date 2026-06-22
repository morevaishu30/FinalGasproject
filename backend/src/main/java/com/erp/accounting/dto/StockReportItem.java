package com.erp.accounting.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class StockReportItem {
    private String itemDescription;
    private Double fillStock;
    private Double emptyStock;
    private Double totalStock;
}
