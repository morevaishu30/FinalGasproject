package com.erp.accounting.controller;

import com.erp.accounting.model.ConsumableInward;
import com.erp.accounting.model.DocumentSequence;
import com.erp.accounting.repository.ConsumableInwardRepository;
import com.erp.accounting.repository.DocumentSequenceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/consumable-inwards")
@CrossOrigin(origins = "*")
public class ConsumableInwardController {

    @Autowired
    private ConsumableInwardRepository repository;

    @Autowired
    private DocumentSequenceRepository seqRepo;

    @GetMapping
    public List<ConsumableInward> getAll() {
        return repository.findAll();
    }

    @PostMapping
    @Transactional
    public ConsumableInward create(@RequestBody ConsumableInward entry) {
        incrementSeq("CONSUMABLE_INWARD_NO");
        return repository.save(entry);
    }

    @GetMapping("/next-inward-no")
    public Map<String, String> getNextInwardNo() {
        Map<String, String> result = new HashMap<>();
        result.put("inwardNo", getNextSeq("CONSUMABLE_INWARD_NO", "CIN25/", 5));
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
