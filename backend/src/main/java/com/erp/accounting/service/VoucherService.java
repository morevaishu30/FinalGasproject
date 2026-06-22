package com.erp.accounting.service;

import com.erp.accounting.model.Voucher;
import com.erp.accounting.model.VoucherAdjustment;
import com.erp.accounting.model.SalesInvoice;
import com.erp.accounting.model.MaterialPurchase;
import com.erp.accounting.repository.VoucherRepository;
import com.erp.accounting.repository.SalesInvoiceRepository;
import com.erp.accounting.repository.MaterialPurchaseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class VoucherService {

    @Autowired
    private VoucherRepository repository;
    @Autowired
    private SalesInvoiceRepository salesInvoiceRepository;
    @Autowired
    private MaterialPurchaseRepository materialPurchaseRepository;

    public List<Voucher> getAll() {
        return repository.findAll();
    }

    public Voucher save(Voucher voucher) {
        Voucher savedVoucher = repository.save(voucher);

        if (voucher.getAdjustments() != null) {
            for (VoucherAdjustment adj : voucher.getAdjustments()) {
                if (adj.getRecAmount() != null && adj.getRecAmount() > 0 && adj.getInvoiceId() != null) {
                    if ("SalesInvoice".equalsIgnoreCase(adj.getType())) {
                        Optional<SalesInvoice> optInv = salesInvoiceRepository.findById(adj.getInvoiceId());
                        if (optInv.isPresent()) {
                            SalesInvoice inv = optInv.get();
                            Double currentPaid = inv.getPaidAmount() != null ? inv.getPaidAmount() : 0.0;
                            inv.setPaidAmount(currentPaid + adj.getRecAmount());
                            salesInvoiceRepository.save(inv);
                        }
                    } else if ("MaterialPurchase".equalsIgnoreCase(adj.getType())) {
                        Optional<MaterialPurchase> optPur = materialPurchaseRepository.findById(adj.getInvoiceId());
                        if (optPur.isPresent()) {
                            MaterialPurchase pur = optPur.get();
                            Double currentPaid = pur.getPaidAmount() != null ? pur.getPaidAmount() : 0.0;
                            pur.setPaidAmount(currentPaid + adj.getRecAmount());
                            materialPurchaseRepository.save(pur);
                        }
                    }
                }
            }
        }
        return savedVoucher;
    }
}
