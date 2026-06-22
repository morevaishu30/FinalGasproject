package com.erp.accounting.repository;

import com.erp.accounting.model.MaterialOutwardETM;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaterialOutwardETMRepository extends JpaRepository<MaterialOutwardETM, Long> {

    @Query("SELECT DISTINCT e FROM MaterialOutwardETM e LEFT JOIN FETCH e.items")
    List<MaterialOutwardETM> findAllWithItems();
}
