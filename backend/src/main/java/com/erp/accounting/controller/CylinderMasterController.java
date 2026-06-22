package com.erp.accounting.controller;

import com.erp.accounting.model.CylinderMaster;
import com.erp.accounting.service.CylinderMasterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/cylinders")
@CrossOrigin(origins = "*")
public class CylinderMasterController {

    @Autowired
    private CylinderMasterService service;

    @GetMapping
    public List<CylinderMaster> getAll(@RequestHeader(value = "X-Financial-Year", required = false) String financialYear) {
        return service.getAll(financialYear);
    }

    @PostMapping
    public CylinderMaster create(@RequestBody CylinderMaster cylinder, @RequestHeader(value = "X-Financial-Year", required = false) String financialYear) {
        return service.save(cylinder, financialYear);
    }

    @PutMapping("/{id}")
    public CylinderMaster update(@PathVariable Long id, @RequestBody CylinderMaster cylinder, @RequestHeader(value = "X-Financial-Year", required = false) String financialYear) {
        cylinder.setId(id);
        return service.save(cylinder, financialYear);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
