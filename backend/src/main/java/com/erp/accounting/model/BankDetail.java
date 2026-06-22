package com.erp.accounting.model;

import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class BankDetail {
    private String bankName;
    private String bankBranch;
    private String accountNo;
    private String ifscCode;
    private String bankAccountType;
    private String bankDetailsExtra; // For "Bank D..." column if needed
}
