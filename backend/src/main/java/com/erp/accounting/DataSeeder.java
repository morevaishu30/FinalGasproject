package com.erp.accounting;

import com.erp.accounting.model.*;
import com.erp.accounting.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class DataSeeder implements CommandLineRunner {

    @Autowired
    private CustomerLedgerRepository customerLedgerRepository;

    @Autowired
    private SupplierLedgerRepository supplierLedgerRepository;

    @Autowired
    private ItemGroupRepository itemGroupRepository;

    @Autowired
    private CylinderMasterRepository cylinderMasterRepository;

    @Autowired
    private MaterialInwardECRRepository materialInwardECRRepository;

    @Autowired
    private MaterialOutwardETMRepository materialOutwardETMRepository;

    @Autowired
    private MaterialInwardFTMRepository materialInwardFTMRepository;

    @Autowired
    private MaterialOutwardGDARepository materialOutwardGDARepository;

    @Autowired
    private SalesInvoiceRepository salesInvoiceRepository;

    @Autowired
    private MaterialPurchaseRepository materialPurchaseRepository;

    @Autowired
    private FinancialYearRepository financialYearRepository;

    @Override
    public void run(String... args) throws Exception {

        // ── Guard 1: Seed master data only if Premier Gas Agency not found ──
        boolean customerExists = customerLedgerRepository.findAll().stream()
                .anyMatch(c -> "M/s. Premier Gas Agency".equals(c.getCustomerName()));
        if (!customerExists) {
            System.out.println("Seeding master data (customers, suppliers, cylinders)...");

            // Financial Year
            FinancialYear fy = new FinancialYear();
            fy.setYearRange("2025-2026");
            fy.setActive(true);
            financialYearRepository.save(fy);

            // Item Group
            ItemGroup itemGroup = new ItemGroup();
            itemGroup.setName("Industrial Oxygen");
            itemGroup.setHsnCode("28044000");
            itemGroupRepository.save(itemGroup);

            // Customer Ledger
            CustomerLedger customer = new CustomerLedger();
            customer.setCustomerName("M/s. Premier Gas Agency");
            customer.setPrintName("Premier Gas Agency");
            customer.setAccountType("Sales Party");
            customer.setAddress1("Plot No 45, MIDC Bhosari");
            customer.setCity("Pune");
            customer.setState("Maharashtra");
            customer.setPincode("411026");
            customer.setGstin("27BIZPM6147D1ZK");
            customer.setFinancialYearId("2025-2026");
            customerLedgerRepository.save(customer);

            // Supplier Ledger
            SupplierLedger supplier = new SupplierLedger();
            supplier.setSupplierName("Bhosari Gas Refilling Co.");
            supplier.setPrintName("Bhosari Refilling");
            supplier.setAccountType("Purchase Party");
            supplier.setAddress1("Sector 2, Bhosari Industrial Area");
            supplier.setCity("Pune");
            supplier.setState("Maharashtra");
            supplier.setPincode("411026");
            supplier.setGstin("27AFSFS7860R1ZL");
            supplier.setFinancialYearId("2025-2026");
            supplierLedgerRepository.save(supplier);

            // Transporter
            SupplierLedger transporter = new SupplierLedger();
            transporter.setSupplierName("Durga Transporters");
            transporter.setPrintName("Durga Transporters");
            transporter.setAccountType("Purchase Party");
            transporter.setAddress1("Alandi Road, Pune");
            transporter.setCity("Pune");
            transporter.setState("Maharashtra");
            transporter.setFinancialYearId("2025-2026");
            supplierLedgerRepository.save(transporter);

            // Cylinder Master
            CylinderMaster cyl1 = new CylinderMaster();
            cyl1.setCylinderOriginalNo("CYL-O2-101");
            cyl1.setCylinderOwnership("OURS");
            cyl1.setCylinderStatus("EMPTY");
            cyl1.setCapacity("7.0");
            cyl1.setFinancialYearId("2025-2026");
            cylinderMasterRepository.save(cyl1);

            CylinderMaster cyl2 = new CylinderMaster();
            cyl2.setCylinderOriginalNo("CYL-O2-102");
            cyl2.setCylinderOwnership("OURS");
            cyl2.setCylinderStatus("EMPTY");
            cyl2.setCapacity("7.0");
            cyl2.setFinancialYearId("2025-2026");
            cylinderMasterRepository.save(cyl2);

            CylinderMaster cyl3 = new CylinderMaster();
            cyl3.setCylinderOriginalNo("CYL-O2-103");
            cyl3.setCylinderOwnership("OURS");
            cyl3.setCylinderStatus("EMPTY");
            cyl3.setCapacity("7.0");
            cyl3.setFinancialYearId("2025-2026");
            cylinderMasterRepository.save(cyl3);

            System.out.println("Master data seeded successfully!");
        } else {
            System.out.println("Database already contains data, skipping master seeder.");
        }

        // ── Guard 2: Seed ECR/ETM/FTM/GDA + Invoices if sales_invoices table is empty ──
        if (salesInvoiceRepository.count() == 0) {
            System.out.println("No sales invoices found. Seeding demo cylinder flow and invoices...");

            String fyId = "2025-2026";

            // ── ECR: Customer returns empty cylinders ──
            MaterialInwardECR ecr = new MaterialInwardECR();
            ecr.setEcrNo("PO26ECR/00071");
            ecr.setEntryDate(LocalDate.of(2026, 6, 1));
            ecr.setPartyName("M/s. Premier Gas Agency");
            ecr.setLocation("DEFAULT ADDRESS");
            ecr.setChallanNo("CH-2991");
            ecr.setChallanDate(LocalDate.of(2026, 6, 1));
            ecr.setVehicleType("Transporter");
            ecr.setContractor("Durga Transporters");
            ecr.setVehicleRegNo("MH-14-EU-1234");
            ecr.setFinancialYearId(fyId);

            MaterialInwardECRItem ecrItem1 = new MaterialInwardECRItem();
            ecrItem1.setCylinderNo("CYL-O2-101");
            ecrItem1.setCapacity(7.0);
            ecrItem1.setItemDescription("Industrial Oxygen");
            ecrItem1.setSupplyDt(LocalDate.of(2026, 6, 1));

            MaterialInwardECRItem ecrItem2 = new MaterialInwardECRItem();
            ecrItem2.setCylinderNo("CYL-O2-102");
            ecrItem2.setCapacity(7.0);
            ecrItem2.setItemDescription("Industrial Oxygen");
            ecrItem2.setSupplyDt(LocalDate.of(2026, 6, 1));

            MaterialInwardECRItem ecrItem3 = new MaterialInwardECRItem();
            ecrItem3.setCylinderNo("CYL-O2-103");
            ecrItem3.setCapacity(7.0);
            ecrItem3.setItemDescription("Industrial Oxygen");
            ecrItem3.setSupplyDt(LocalDate.of(2026, 6, 1));

            ecr.getItems().add(ecrItem1);
            ecr.getItems().add(ecrItem2);
            ecr.getItems().add(ecrItem3);
            materialInwardECRRepository.save(ecr);

            // ── ETM: Send empty cylinders to manufacturer ──
            MaterialOutwardETM etm = new MaterialOutwardETM();
            etm.setSerialNo("ETM/2026/00054");
            etm.setEntryDate(LocalDate.of(2026, 6, 2));
            etm.setPartyName("Bhosari Gas Refilling Co.");
            etm.setLocation("DEFAULT ADDRESS");
            etm.setVehicleType("Transporter");
            etm.setContractor("Durga Transporters");
            etm.setVehicleRegNo("MH-14-EU-1234");
            etm.setFinancialYearId(fyId);

            MaterialOutwardETMItem etmItem1 = new MaterialOutwardETMItem();
            etmItem1.setCylinderNo("CYL-O2-101");
            etmItem1.setCapacity("7.0");
            etmItem1.setItemDescription("Industrial Oxygen");
            etmItem1.setUnit("CUM");

            MaterialOutwardETMItem etmItem2 = new MaterialOutwardETMItem();
            etmItem2.setCylinderNo("CYL-O2-102");
            etmItem2.setCapacity("7.0");
            etmItem2.setItemDescription("Industrial Oxygen");
            etmItem2.setUnit("CUM");

            MaterialOutwardETMItem etmItem3 = new MaterialOutwardETMItem();
            etmItem3.setCylinderNo("CYL-O2-103");
            etmItem3.setCapacity("7.0");
            etmItem3.setItemDescription("Industrial Oxygen");
            etmItem3.setUnit("CUM");

            etm.getItems().add(etmItem1);
            etm.getItems().add(etmItem2);
            etm.getItems().add(etmItem3);
            materialOutwardETMRepository.save(etm);

            // ── FTM: Receive filled cylinders from manufacturer ──
            MaterialInwardFTM ftm = new MaterialInwardFTM();
            ftm.setEntryNo("FTM/2026/00082");
            ftm.setEntryDate(LocalDate.of(2026, 6, 3));
            ftm.setCustomerName("Bhosari Gas Refilling Co.");
            ftm.setEtmNo("ETM/2026/00054");
            ftm.setVehicleType("Transporter");
            ftm.setContractor("Durga Transporters");
            ftm.setVehicleRegNo("MH-14-EU-1234");
            ftm.setFinancialYearId(fyId);

            MaterialInwardFTMItem ftmItem1 = new MaterialInwardFTMItem();
            ftmItem1.setCylinderNo("CYL-O2-101");
            ftmItem1.setCapacity(7.0);
            ftmItem1.setItemDescription("Industrial Oxygen");
            ftmItem1.setRecQty(7.0);
            ftmItem1.setUnit("CUM");

            MaterialInwardFTMItem ftmItem2 = new MaterialInwardFTMItem();
            ftmItem2.setCylinderNo("CYL-O2-102");
            ftmItem2.setCapacity(7.0);
            ftmItem2.setItemDescription("Industrial Oxygen");
            ftmItem2.setRecQty(7.0);
            ftmItem2.setUnit("CUM");

            MaterialInwardFTMItem ftmItem3 = new MaterialInwardFTMItem();
            ftmItem3.setCylinderNo("CYL-O2-103");
            ftmItem3.setCapacity(7.0);
            ftmItem3.setItemDescription("Industrial Oxygen");
            ftmItem3.setRecQty(7.0);
            ftmItem3.setUnit("CUM");

            ftm.getItems().add(ftmItem1);
            ftm.getItems().add(ftmItem2);
            ftm.getItems().add(ftmItem3);
            materialInwardFTMRepository.save(ftm);

            // ── GDA: Deliver filled cylinders to customer ──
            MaterialOutwardGDA gda = new MaterialOutwardGDA();
            gda.setGdaNo("GDA26/00124");
            gda.setEntryDate(LocalDate.of(2026, 6, 4));
            gda.setPartyName("M/s. Premier Gas Agency");
            gda.setLocation("DEFAULT ADDRESS");
            gda.setVehicleType("Transporter");
            gda.setContractor("Durga Transporters");
            gda.setVehicleRegNo("MH-14-EU-1234");
            gda.setFinancialYearId(fyId);

            MaterialOutwardGDAItem gdaItem1 = new MaterialOutwardGDAItem();
            gdaItem1.setCylinderNo("CYL-O2-101");
            gdaItem1.setItemDescription("Industrial Oxygen");
            gdaItem1.setCapacity(7.0);
            gdaItem1.setQty(7.0);
            gdaItem1.setRate(50.0);
            gdaItem1.setAmount(350.0);

            MaterialOutwardGDAItem gdaItem2 = new MaterialOutwardGDAItem();
            gdaItem2.setCylinderNo("CYL-O2-102");
            gdaItem2.setItemDescription("Industrial Oxygen");
            gdaItem2.setCapacity(7.0);
            gdaItem2.setQty(7.0);
            gdaItem2.setRate(50.0);
            gdaItem2.setAmount(350.0);

            MaterialOutwardGDAItem gdaItem3 = new MaterialOutwardGDAItem();
            gdaItem3.setCylinderNo("CYL-O2-103");
            gdaItem3.setItemDescription("Industrial Oxygen");
            gdaItem3.setCapacity(7.0);
            gdaItem3.setQty(7.0);
            gdaItem3.setRate(50.0);
            gdaItem3.setAmount(350.0);

            gda.getItems().add(gdaItem1);
            gda.getItems().add(gdaItem2);
            gda.getItems().add(gdaItem3);
            materialOutwardGDARepository.save(gda);

            // ── Purchase Invoice (matching FTM/ETM) ──
            MaterialPurchase purchase = new MaterialPurchase();
            purchase.setPurchaseAc("PURCHASE ACCOUNT - GAS");
            purchase.setEntryNo("PUR/2026/00021");
            purchase.setEntryDate(LocalDate.of(2026, 6, 3));
            purchase.setSupplierName("Bhosari Gas Refilling Co.");
            purchase.setSupplierLocation("DEFAULT ADDRESS");
            purchase.setSupplierAddress("Sector 2, Bhosari Industrial Area, Pune");
            purchase.setInvoiceType("REGULAR");
            purchase.setTaxType("GST LOCAL");
            purchase.setGstType("Purchase Taxable");
            purchase.setBillNo("PI-9921");
            purchase.setBillDate(LocalDate.of(2026, 6, 3));
            purchase.setGrossTotal(360.0);
            purchase.setDiscount(0.0);
            purchase.setPf(0.0);
            purchase.setFreight(0.0);
            purchase.setCgst(32.40);
            purchase.setSgst(32.40);
            purchase.setIgst(0.0);
            purchase.setNetTotal(424.80);
            purchase.setFinancialYearId(fyId);

            MaterialPurchaseItem purItem = new MaterialPurchaseItem();
            purItem.setItemDescription("Industrial Oxygen Refilling");
            purItem.setUnit("CUM");
            purItem.setOurCyl(3);
            purItem.setPartyCyl(0);
            purItem.setCapacity(7.0);
            purItem.setQty(21.0);
            purItem.setRatePer("Qty");
            purItem.setRate(17.14);
            purItem.setAmount(360.0);
            purchase.getItems().add(purItem);
            materialPurchaseRepository.save(purchase);

            // ── Sales Invoice No. 060 (matches GDA & ECR flow) ──
            SalesInvoice sales = new SalesInvoice();
            sales.setSalesAc("SALES ACCOUNT - MATERIAL");
            sales.setInvoiceNo("060");
            sales.setInvoiceDate(LocalDate.of(2026, 6, 4));
            sales.setInvoiceType("REGULAR");
            sales.setTaxType("GST LOCAL");
            sales.setGstType("Sales Taxable");
            sales.setCustomerName("M/s. Premier Gas Agency");
            sales.setCustomerLocation("DEFAULT ADDRESS");
            sales.setCustomerAddress("Plot No 45, MIDC Bhosari, Pune 411026");
            sales.setDrChallanNo("CH-2991");
            sales.setCrDays(30);
            sales.setDueDate(LocalDate.of(2026, 7, 4));
            sales.setGrossTotal(1050.0);
            sales.setDiscount(0.0);
            sales.setPf(0.0);
            sales.setFreight(0.0);
            sales.setOther(0.0);
            sales.setCgst(94.50);
            sales.setSgst(94.50);
            sales.setIgst(0.0);
            sales.setRoundOff(0.0);
            sales.setNetTotal(1239.0);
            sales.setTotalQty(21.0);
            sales.setFinancialYearId(fyId);

            SalesInvoiceItem salesItem = new SalesInvoiceItem();
            salesItem.setItemDescription("Industrial Oxygen");
            salesItem.setUnit("CUM");
            salesItem.setOurCyl(3);
            salesItem.setPartyCyl(0);
            salesItem.setCapacity(7.0);
            salesItem.setQty(21.0);
            salesItem.setRatePer("Qty");
            salesItem.setRate(50.0);
            salesItem.setAmount(1050.0);
            salesItem.setHsn("28044000");
            sales.getItems().add(salesItem);
            salesInvoiceRepository.save(sales);

            System.out.println("Demo cylinder flow (ECR->ETM->FTM->GDA) + invoices seeded successfully!");
        } else {
            System.out.println("Sales invoices already exist, skipping transaction seeder.");
        }
    }
}
