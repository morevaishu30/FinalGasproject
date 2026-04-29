package com.erp.accounting.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
public class SupplierLedger extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Top Panel Fields
    private String supplierName;
    private String printName;
    private String accountType;
    private String underGroup;
    private String alternateUnderGroup;
    private String diaryName;
    
    private Boolean vehicleQa;
    private Boolean qrCodePrint;
    private Boolean inactiveAc;
    private Boolean legalCase;

    // Tab 1: Accounting Detail
    private String terms;
    private Integer termsDays;
    private Double creditLimit;
    private Integer holdingQty;
    private Integer creditDays;
    private Double debitInterest;
    private Double creditInterest;
    private String operatingType;

    private String expType;

    // Tab 2: Address Detail
    private String location;
    private Boolean inactiveLocation;
    private String address1;
    private String address2;
    private String address3;
    private String city;
    private String state;
    private String pincode;
    private String areaName;
    private String mobile;
    private String phone;
    private String fax;
    private String email;
    private String website;

    // Tab 3: Registration Detail
    private String gstin;
    private String pan;
    private String registrationType;
    private String lutNo;
    private String lutEffectDate;
    private String aadharNo;
    private String cinNo;
    private String customerCode;
    private String msmeNumber;
    private String category;
    private String salesMen;
    
    // Other Details (Tab 3)
    private Boolean arcParty;
    private Boolean govtParty;
    private Boolean msmeParty;
    private String exemptionCertNo;
    private Boolean showInLoadingReport;

    // Cylinder Detail (Tab 3)
    private Boolean notCheckPrefixForEcr;
    private String customerCylinderPrefix;
    private Integer holdingDays;

    // TDS Detail (Tab 3)
    private Boolean tds;
    private String tdsType;
    private String tdsSource;

    // Bank Details Collection
    @jakarta.persistence.ElementCollection
    private java.util.List<BankDetail> bankDetails = new java.util.ArrayList<>();

    // Tab 4: Tax/Item/Sector Detail
    private String taxCode;
    private String partyGroup;
    private String sector;
    private String customerType;
    private String customerGrade;
    private String tradeType;
    private String testCertRemarks;

    // Collections for tables in UI
    @jakarta.persistence.ElementCollection
    private java.util.List<String> branchKM;

    @jakarta.persistence.ElementCollection
    private java.util.List<ContactDetail> contacts = new java.util.ArrayList<>();

    @jakarta.persistence.ElementCollection
    private java.util.List<String> itemGroupDealings;
}
