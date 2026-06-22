package com.erp.accounting.service;

import com.erp.accounting.dto.StockReportItem;
import com.erp.accounting.dto.HoldingReportItem;
import jakarta.persistence.EntityManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ReportService {

    @Autowired
    private EntityManager entityManager;

    public List<StockReportItem> getStockReport() {
        // Query FTM
        List<Object[]> ftmList = entityManager.createQuery("SELECT i.itemDescription, SUM(i.recQty) FROM MaterialInwardFTMItem i WHERE i.itemDescription IS NOT NULL GROUP BY i.itemDescription", Object[].class).getResultList();
        
        // Query GDA
        List<Object[]> gdaList = entityManager.createQuery("SELECT i.itemDescription, SUM(i.qty) FROM MaterialOutwardGDAItem i WHERE i.itemDescription IS NOT NULL GROUP BY i.itemDescription", Object[].class).getResultList();
        
        // Query ECR
        List<Object[]> ecrList = entityManager.createQuery("SELECT i.itemDescription, COUNT(i.id) FROM MaterialInwardECRItem i WHERE i.itemDescription IS NOT NULL GROUP BY i.itemDescription", Object[].class).getResultList();
        
        // Query ETM
        List<Object[]> etmList = entityManager.createQuery("SELECT i.itemDescription, COUNT(i.id) FROM MaterialOutwardETMItem i WHERE i.itemDescription IS NOT NULL GROUP BY i.itemDescription", Object[].class).getResultList();
        
        Map<String, StockReportItem> reportMap = new HashMap<>();
        
        // Process FTM
        for(Object[] row : ftmList) {
            String item = (String) row[0];
            Double qty = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
            reportMap.putIfAbsent(item, new StockReportItem(item, 0.0, 0.0, 0.0));
            reportMap.get(item).setFillStock(reportMap.get(item).getFillStock() + qty);
        }
        
        // Process GDA
        for(Object[] row : gdaList) {
            String item = (String) row[0];
            Double qty = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
            reportMap.putIfAbsent(item, new StockReportItem(item, 0.0, 0.0, 0.0));
            reportMap.get(item).setFillStock(reportMap.get(item).getFillStock() - qty);
        }
        
        // Process ECR
        for(Object[] row : ecrList) {
            String item = (String) row[0];
            Double qty = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
            reportMap.putIfAbsent(item, new StockReportItem(item, 0.0, 0.0, 0.0));
            reportMap.get(item).setEmptyStock(reportMap.get(item).getEmptyStock() + qty);
        }
        
        // Process ETM
        for(Object[] row : etmList) {
            String item = (String) row[0];
            Double qty = row[1] != null ? ((Number) row[1]).doubleValue() : 0.0;
            reportMap.putIfAbsent(item, new StockReportItem(item, 0.0, 0.0, 0.0));
            reportMap.get(item).setEmptyStock(reportMap.get(item).getEmptyStock() - qty);
        }
        
        // Calculate Total Stock
        for(StockReportItem item : reportMap.values()) {
            item.setTotalStock(item.getFillStock() + item.getEmptyStock());
        }
        
        return new ArrayList<>(reportMap.values());
    }

    public List<HoldingReportItem> getCylinderHoldingReport() {
        // Holding = GDA - ECR per party, per item
        // GDA
        List<Object[]> gdaList = entityManager.createQuery("SELECT parent.partyName, i.itemDescription, SUM(i.qty) FROM MaterialOutwardGDA parent JOIN parent.items i WHERE parent.partyName IS NOT NULL AND i.itemDescription IS NOT NULL GROUP BY parent.partyName, i.itemDescription", Object[].class).getResultList();
        
        // ECR
        List<Object[]> ecrList = entityManager.createQuery("SELECT parent.partyName, i.itemDescription, COUNT(i.id) FROM MaterialInwardECR parent JOIN parent.items i WHERE parent.partyName IS NOT NULL AND i.itemDescription IS NOT NULL GROUP BY parent.partyName, i.itemDescription", Object[].class).getResultList();
        
        Map<String, HoldingReportItem> reportMap = new HashMap<>();
        
        for(Object[] row : gdaList) {
            String party = (String) row[0];
            String item = (String) row[1];
            Double qty = row[2] != null ? ((Number) row[2]).doubleValue() : 0.0;
            String key = party + "|" + item;
            reportMap.put(key, new HoldingReportItem(party, item, qty));
        }
        
        for(Object[] row : ecrList) {
            String party = (String) row[0];
            String item = (String) row[1];
            Double qty = row[2] != null ? ((Number) row[2]).doubleValue() : 0.0;
            String key = party + "|" + item;
            reportMap.putIfAbsent(key, new HoldingReportItem(party, item, 0.0));
            HoldingReportItem dto = reportMap.get(key);
            dto.setHoldingQty(dto.getHoldingQty() - qty);
        }
        
        return new ArrayList<>(reportMap.values());
    }
}
