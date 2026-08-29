package com.erp.accounting.controller;

import com.erp.accounting.model.ItemMaster;
import com.erp.accounting.repository.ItemMasterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/item-masters")
@CrossOrigin(origins = "*")
public class ItemMasterController {
    @Autowired private ItemMasterRepository repository;

    @GetMapping
    public List<ItemMaster> getAll(@RequestHeader(value = "X-Financial-Year", required = false) String financialYear) {
        if (financialYear == null || financialYear.trim().isEmpty()) return repository.findAll();
        return repository.findAllByFinancialYearId(financialYear);
    }

    @PostMapping
    public ItemMaster create(@RequestBody ItemMaster master, @RequestHeader(value = "X-Financial-Year", required = false) String financialYear) {
        if (financialYear != null && !financialYear.trim().isEmpty()) {
            master.setFinancialYearId(financialYear);
        } else if (master.getFinancialYearId() == null || master.getFinancialYearId().trim().isEmpty()) {
            master.setFinancialYearId("2025-2026");
        }
        return repository.save(master);
    }

    @PutMapping("/{id}")
    public ItemMaster update(@PathVariable Long id, @RequestBody ItemMaster master, @RequestHeader(value = "X-Financial-Year", required = false) String financialYear) {
        master.setId(id);
        if (financialYear != null && !financialYear.trim().isEmpty()) {
            master.setFinancialYearId(financialYear);
        } else if (master.getFinancialYearId() == null || master.getFinancialYearId().trim().isEmpty()) {
            master.setFinancialYearId("2025-2026");
        }
        return repository.save(master);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        repository.deleteById(id);
    }
}
