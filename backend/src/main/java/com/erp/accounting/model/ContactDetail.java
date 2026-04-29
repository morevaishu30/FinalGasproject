package com.erp.accounting.model;

import jakarta.persistence.Embeddable;
import lombok.Data;

@Embeddable
@Data
public class ContactDetail {
    private String personName;
    private String designation;
    private String mobile;
    private String email;
    private String emailType;
}
