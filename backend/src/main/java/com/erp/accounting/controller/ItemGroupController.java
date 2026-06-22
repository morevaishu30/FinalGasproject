package com.erp.accounting.controller;

import com.erp.accounting.model.ItemGroup;
import com.erp.accounting.repository.ItemGroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/item-groups")
@CrossOrigin(origins = "*")
public class ItemGroupController {

    @Autowired
    private ItemGroupRepository itemGroupRepository;

    @GetMapping
    public List<ItemGroup> getAllItemGroups() {
        return itemGroupRepository.findAll();
    }

    @PostMapping
    public ItemGroup createItemGroup(@RequestBody ItemGroup itemGroup) {
        return itemGroupRepository.save(itemGroup);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteItemGroup(@PathVariable Long id) {
        return itemGroupRepository.findById(id).map(itemGroup -> {
            itemGroupRepository.delete(itemGroup);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
