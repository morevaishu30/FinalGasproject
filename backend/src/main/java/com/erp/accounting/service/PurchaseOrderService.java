package com.erp.accounting.service;

import com.erp.accounting.model.PurchaseOrder;
import com.erp.accounting.repository.PurchaseOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class PurchaseOrderService {

    @Autowired
    private PurchaseOrderRepository repository;

    public String generateNextEntryNo(String financialYearId) {
        return generateSequence(financialYearId, "PO", 0, repository.findMaxEntryNo(financialYearId));
    }

    public String generateNextSupplierOrderNo(String financialYearId) {
        String entryNo = generateNextEntryNo(financialYearId);
        return entryNo.replace("PO25", "PO26"); // Matches original logic
    }

    private String generateSequence(String financialYearId, String prefixBase, int yearOffset, Optional<String> maxVal) {
        String yearShort = "25";
        if (financialYearId != null && financialYearId.length() >= 4) {
            try {
                int year = Integer.parseInt(financialYearId.substring(2, 4)) + yearOffset;
                yearShort = String.valueOf(year);
            } catch (NumberFormatException e) {
                yearShort = "25";
            }
        }

        String prefix = prefixBase + yearShort + "DRF/";
        
        int nextNum = 1;
        if (maxVal.isPresent() && maxVal.get().startsWith(prefix)) {
            try {
                String numPart = maxVal.get().substring(prefix.length());
                nextNum = Integer.parseInt(numPart) + 1;
            } catch (NumberFormatException e) {
                nextNum = 1;
            }
        }
        
        return prefix + String.format("%05d", nextNum);
    }

    public PurchaseOrder save(PurchaseOrder order) {
        return repository.save(order);
    }
}
