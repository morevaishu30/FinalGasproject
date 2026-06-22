package com.erp.accounting.controller;

import com.erp.accounting.model.Voucher;
import com.erp.accounting.service.VoucherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vouchers")
@CrossOrigin(origins = "*")
public class VoucherController {

    @Autowired
    private VoucherService service;

    @GetMapping
    public List<Voucher> getAll() {
        return service.getAll();
    }

    @PostMapping
    public Voucher create(@RequestBody Voucher voucher) {
        return service.save(voucher);
    }
}
