package com.erp.accounting.controller;

import com.erp.accounting.model.CylinderPurchaseOrder;
import com.erp.accounting.model.DocumentSequence;
import com.erp.accounting.repository.CylinderPurchaseOrderRepository;
import com.erp.accounting.repository.DocumentSequenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cylinder-purchase-orders")
@CrossOrigin(origins = "*")
public class CylinderPurchaseOrderController {

    @Autowired
    private CylinderPurchaseOrderRepository repository;

    @Autowired
    private DocumentSequenceRepository seqRepo;

    @GetMapping
    public List<CylinderPurchaseOrder> getAll(@RequestHeader(value = "X-Financial-Year", required = false) String financialYear) {
        if (financialYear == null) return repository.findAll();
        return repository.findAll(); // Should filter by financialYear in a real app
    }

    @PostMapping
    @Transactional
    public CylinderPurchaseOrder create(@RequestBody CylinderPurchaseOrder order, @RequestHeader(value = "X-Financial-Year", required = false) String financialYear) {
        System.out.println("Creating Cylinder Purchase Order: " + order.getEntryNo());
        
        // Increment the sequences since they are now consumed
        incrementSeq("CYLINDER_PO_ENTRY");
        incrementSeq("CYLINDER_PO_SUPP");

        if (financialYear != null) order.setFinancialYearId(financialYear);
        return repository.save(order);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CylinderPurchaseOrder> getById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<CylinderPurchaseOrder> update(@PathVariable Long id, @RequestBody CylinderPurchaseOrder orderDetails, @RequestHeader(value = "X-Financial-Year", required = false) String financialYear) {
        return repository.findById(id)
                .map(order -> {
                    if (financialYear != null) order.setFinancialYearId(financialYear);
                    order.setEntryNo(orderDetails.getEntryNo());
                    order.setEntryDate(orderDetails.getEntryDate());
                    order.setCustomerName(orderDetails.getCustomerName());
                    order.setCustomerLocation(orderDetails.getCustomerLocation());
                    order.setCustomerAddress(orderDetails.getCustomerAddress());
                    order.setSalesExecutive(orderDetails.getSalesExecutive());
                    order.setOrderType1(orderDetails.getOrderType1());
                    order.setOrderType2(orderDetails.getOrderType2());
                    order.setOrderType3(orderDetails.getOrderType3());
                    order.setLdApplicable(orderDetails.getLdApplicable());
                    order.setLdOn(orderDetails.getLdOn());
                    order.setLdRate(orderDetails.getLdRate());
                    
                    order.setSupplierOrderNo(orderDetails.getSupplierOrderNo());
                    order.setSupplierOrderDate(orderDetails.getSupplierOrderDate());
                    order.setConsigneeName(orderDetails.getConsigneeName());
                    order.setConsigneeLocation(orderDetails.getConsigneeLocation());
                    order.setConsigneeAddress(orderDetails.getConsigneeAddress());
                    order.setQuotationNo(orderDetails.getQuotationNo());
                    order.setQuotationDate(orderDetails.getQuotationDate());
                    order.setDepositAmount(orderDetails.getDepositAmount());
                    order.setTransportationAmount(orderDetails.getTransportationAmount());
                    order.setTaxType(orderDetails.getTaxType());
                    order.setImportedItem(orderDetails.getImportedItem());
                    order.setCloseOrder(orderDetails.getCloseOrder());
                    order.setGenerateRateMaster(orderDetails.getGenerateRateMaster());
                    order.setSubject(orderDetails.getSubject());
                    order.setScopeOfSupply(orderDetails.getScopeOfSupply());
                    
                    order.getItems().clear();
                    order.getItems().addAll(orderDetails.getItems());
                    
                    order.setGrossTotal(orderDetails.getGrossTotal());
                    order.setDiscountRate(orderDetails.getDiscountRate());
                    order.setDiscount(orderDetails.getDiscount());
                    order.setPf(orderDetails.getPf());
                    order.setFreight(orderDetails.getFreight());
                    order.setOtherCharges(orderDetails.getOtherCharges());
                    order.setIgst(orderDetails.getIgst());
                    order.setSgst(orderDetails.getSgst());
                    order.setCgst(orderDetails.getCgst());
                    order.setNoTaxDkp(orderDetails.getNoTaxDkp());
                    order.setNoTaxDisc(orderDetails.getNoTaxDisc());
                    order.setTcsRate(orderDetails.getTcsRate());
                    order.setTcs(orderDetails.getTcs());
                    order.setNetTotal(orderDetails.getNetTotal());
                    
                    return ResponseEntity.ok(repository.save(order));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        return repository.findById(id)
                .map(order -> {
                    repository.delete(order);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/next-entry-no")
    public Map<String, String> getNextEntryNo() {
        Map<String, String> result = new HashMap<>();
        
        result.put("entryNo", getNextSeq("CYLINDER_PO_ENTRY", "CYPO25/", 5));
        result.put("supplierOrderNo", getNextSeq("CYLINDER_PO_SUPP", "SUP26/", 5));
        
        return result;
    }

    private String getNextSeq(String type, String defaultPrefix, int padding) {
        DocumentSequence seq = seqRepo.findById(type).orElseGet(() -> {
            DocumentSequence s = new DocumentSequence();
            s.setDocumentType(type);
            s.setPrefix(defaultPrefix);
            s.setNextSequence(1L);
            s.setPadding(padding);
            return seqRepo.save(s);
        });
        return seq.getPrefix() + String.format("%0" + seq.getPadding() + "d", seq.getNextSequence());
    }

    private void incrementSeq(String type) {
        seqRepo.findById(type).ifPresent(seq -> {
            seq.setNextSequence(seq.getNextSequence() + 1);
            seqRepo.save(seq);
        });
    }

    @GetMapping("/pending/{customerName}")
    public List<CylinderPurchaseOrder> getPendingOrders(@PathVariable String customerName) {
        return repository.findByCustomerName(customerName);
    }
}
