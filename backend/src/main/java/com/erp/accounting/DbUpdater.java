package com.erp.accounting;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DbUpdater implements CommandLineRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            jdbcTemplate.execute("ALTER TABLE supplier_ledger DROP COLUMN IF EXISTS alternate_under_group");
            jdbcTemplate.execute("ALTER TABLE supplier_ledger DROP COLUMN IF EXISTS diary_name");
            jdbcTemplate.execute("ALTER TABLE supplier_ledger DROP COLUMN IF EXISTS terms");
            jdbcTemplate.execute("ALTER TABLE supplier_ledger DROP COLUMN IF EXISTS terms_days");
            jdbcTemplate.execute("ALTER TABLE supplier_ledger DROP COLUMN IF EXISTS credit_limit");
            jdbcTemplate.execute("ALTER TABLE supplier_ledger DROP COLUMN IF EXISTS debit_interest");
            jdbcTemplate.execute("ALTER TABLE supplier_ledger DROP COLUMN IF EXISTS credit_interest");
            jdbcTemplate.execute("ALTER TABLE supplier_ledger DROP COLUMN IF EXISTS exp_type");
            jdbcTemplate.execute("ALTER TABLE supplier_ledger DROP COLUMN IF EXISTS fax");
            jdbcTemplate.execute("DROP TABLE IF EXISTS supplier_ledger_branch_km");
            System.out.println("DROPPED COLUMNS SUCCESSFULLY!");
        } catch (Exception e) {
            System.out.println("Error dropping columns: " + e.getMessage());
        }
    }
}
