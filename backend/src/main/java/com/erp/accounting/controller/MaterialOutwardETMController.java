package com.erp.accounting.controller;

import com.erp.accounting.model.MaterialOutwardETM;
import com.erp.accounting.model.DocumentSequence;
import com.erp.accounting.repository.MaterialOutwardETMRepository;
import com.erp.accounting.repository.DocumentSequenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/empty-cylinder-etm")
@CrossOrigin(origins = "*")
public class MaterialOutwardETMController {

    @Autowired
    private MaterialOutwardETMRepository repository;

    @Autowired
    private DocumentSequenceRepository seqRepo;

    @GetMapping
    public List<MaterialOutwardETM> getAll() {
        return repository.findAllWithItems();
    }

    @PostMapping
    @Transactional
    public MaterialOutwardETM create(@RequestBody MaterialOutwardETM entry) {
        incrementSeq("ETM_SERIAL_NO");
        return repository.save(entry);
    }

    @GetMapping("/next-serial-no")
    public Map<String, String> getNextSerialNo() {
        Map<String, String> result = new HashMap<>();
        result.put("serialNo", getNextSeq("ETM_SERIAL_NO", "ETM25/", 5));
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
}
