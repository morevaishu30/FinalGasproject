package com.erp.accounting.service;

import com.erp.accounting.model.CylinderMaster;
import com.erp.accounting.repository.CylinderMasterRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CylinderMasterService {

    @Autowired
    private CylinderMasterRepository repository;

    public List<CylinderMaster> getAll(String financialYearId) {
        if (financialYearId != null) {
            return repository.findByFinancialYearId(financialYearId);
        }
        return repository.findAll();
    }

    public CylinderMaster save(CylinderMaster cylinder, String financialYearId) {
        if (financialYearId != null) {
            cylinder.setFinancialYearId(financialYearId);
        }
        return repository.save(cylinder);
    }

    public Optional<CylinderMaster> getById(Long id) {
        return repository.findById(id);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
