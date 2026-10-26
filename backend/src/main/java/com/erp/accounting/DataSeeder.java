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
            sales.setGdaNo("GDA26/00124");
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

        // ── Ensure Thermax Limited exists ──
        if (customerLedgerRepository.findAll().stream().noneMatch(c -> "Thermax Limited".equalsIgnoreCase(c.getCustomerName()))) {
            CustomerLedger thermax = new CustomerLedger();
            thermax.setCustomerName("Thermax Limited");
            thermax.setPrintName("Thermax Limited");
            thermax.setAccountType("Sales Party");
            thermax.setAddress1("D-13,-R.D.Age Road,MIDC");
            thermax.setAddress2("Chinchwad");
            thermax.setCity("Pune");
            thermax.setState("Maharashtra");
            thermax.setPincode("411019");
            thermax.setGstin("27AAACT3910D1ZS");
            thermax.setCustomerCode("169197");
            thermax.setFinancialYearId("2025-2026");
            customerLedgerRepository.save(thermax);
            System.out.println("Thermax Limited customer seeded.");
        }

        // ── Ensure Invoice 126 exists ──
        if (salesInvoiceRepository.findAll().stream().noneMatch(s -> "126".equals(s.getInvoiceNo()))) {
            SalesInvoice inv126 = new SalesInvoice();
            inv126.setSalesAc("SALES ACCOUNT - MATERIAL");
            inv126.setInvoiceNo("126");
            inv126.setInvoiceDate(LocalDate.of(2026, 8, 17));
            inv126.setInvoiceType("REGULAR");
            inv126.setTaxType("GST LOCAL");
            inv126.setGstType("Sales Taxable");
            inv126.setCustomerName("Thermax Limited");
            inv126.setCustomerLocation("DEFAULT ADDRESS");
            inv126.setCustomerAddress("D-13,-R.D.Age Road,MIDC,\nChinchwad-Pune-411019");
            inv126.setVehicleNo("MH14KG8157");
            inv126.setVendorCode("169197");
            inv126.setPoNo("5510774");
            inv126.setPoDate(LocalDate.of(2026, 8, 4));
            inv126.setChNo("");
            inv126.setCrDays(30);
            inv126.setDueDate(LocalDate.of(2026, 9, 16));
            inv126.setGrossTotal(37350.0);
            inv126.setDiscount(0.0);
            inv126.setPf(0.0);
            inv126.setFreight(0.0);
            inv126.setOther(0.0);
            inv126.setCgst(3361.50);
            inv126.setSgst(3361.50);
            inv126.setIgst(0.0);
            inv126.setRoundOff(0.0);
            inv126.setNetTotal(44073.0);
            inv126.setTotalQty(3.0);
            inv126.setFinancialYearId("2025-2026");

            SalesInvoiceItem itm1 = new SalesInvoiceItem();
            itm1.setItemDescription("DUAL STAGE REGULATORS OXYGEN");
            itm1.setUnit("01 Nos");
            itm1.setQty(1.0);
            itm1.setCapacity(1.0);
            itm1.setRatePer("Nos");
            itm1.setRate(12450.0);
            itm1.setAmount(12450.0);
            itm1.setHsn("84818030");
            inv126.getItems().add(itm1);

            SalesInvoiceItem itm2 = new SalesInvoiceItem();
            itm2.setItemDescription("DUAL STAGE REGULATORS NITROGEN");
            itm2.setUnit("01 Nos");
            itm2.setQty(1.0);
            itm2.setCapacity(1.0);
            itm2.setRatePer("Nos");
            itm2.setRate(12450.0);
            itm2.setAmount(12450.0);
            itm2.setHsn("84818030");
            inv126.getItems().add(itm2);

            SalesInvoiceItem itm3 = new SalesInvoiceItem();
            itm3.setItemDescription("DUAL STAGE REGULATORS CARBON DIOXIDE");
            itm3.setUnit("01 Nos");
            itm3.setQty(1.0);
            itm3.setCapacity(1.0);
            itm3.setRatePer("Nos");
            itm3.setRate(12450.0);
            itm3.setAmount(12450.0);
            itm3.setHsn("84818030");
            inv126.getItems().add(itm3);

            salesInvoiceRepository.save(inv126);
            System.out.println("Invoice 126 seeded successfully!");
        }

        // ── Ensure Techknowgreen Solution Limited exists ──
        if (customerLedgerRepository.findAll().stream().noneMatch(c -> c.getCustomerName() != null && c.getCustomerName().contains("Techknowgreen"))) {
            CustomerLedger techknow = new CustomerLedger();
            techknow.setCustomerName("Techknowgreen Solution Limited.");
            techknow.setPrintName("Techknowgreen Solution Limited.");
            techknow.setAccountType("Sales Party");
            techknow.setAddress1("202, Hem Opal, Plot No.26 Near Joshi Wadewale Lane");
            techknow.setAddress2("Ekta Society, Wakdewadi");
            techknow.setCity("Pune");
            techknow.setState("Maharashtra");
            techknow.setPincode("411005");
            techknow.setGstin("27AAJCT9287E1ZR");
            techknow.setCustomerCode("");
            techknow.setFinancialYearId("2025-2026");
            customerLedgerRepository.save(techknow);
            System.out.println("Techknowgreen Solution Limited customer seeded.");
        }

        // ── Ensure Invoice 131 exists ──
        if (salesInvoiceRepository.findAll().stream().noneMatch(s -> "131".equals(s.getInvoiceNo()))) {
            SalesInvoice inv131 = new SalesInvoice();
            inv131.setSalesAc("SALES ACCOUNT - MATERIAL");
            inv131.setInvoiceNo("131");
            inv131.setInvoiceDate(LocalDate.of(2026, 8, 20));
            inv131.setInvoiceType("REGULAR");
            inv131.setTaxType("GST LOCAL");
            inv131.setGstType("Sales Taxable");
            inv131.setCustomerName("Thermax Limited");
            inv131.setCustomerLocation("DEFAULT ADDRESS");
            inv131.setCustomerAddress("D-13,-R.D.Age Road,MIDC,\nChinchwad-Pune-411019");
            inv131.setVehicleNo("MH14KG8157");
            inv131.setVendorCode("169197");
            inv131.setPoNo("5510774");
            inv131.setPoDate(LocalDate.of(2026, 8, 4));
            inv131.setChNo("N/A");
            inv131.setCrDays(30);
            inv131.setDueDate(LocalDate.of(2026, 9, 19));
            inv131.setGrossTotal(37350.0);
            inv131.setDiscount(0.0);
            inv131.setPf(0.0);
            inv131.setFreight(0.0);
            inv131.setOther(0.0);
            inv131.setCgst(3361.50);
            inv131.setSgst(3361.50);
            inv131.setIgst(0.0);
            inv131.setRoundOff(0.0);
            inv131.setNetTotal(44073.0);
            inv131.setTotalQty(3.0);
            inv131.setFinancialYearId("2025-2026");

            SalesInvoiceItem itm1 = new SalesInvoiceItem();
            itm1.setItemDescription("DUAL STAGE REGULATORS OXYGEN");
            itm1.setUnit("01 Nos");
            itm1.setQty(1.0);
            itm1.setCapacity(1.0);
            itm1.setRatePer("Nos");
            itm1.setRate(12450.0);
            itm1.setAmount(12450.0);
            itm1.setHsn("84818030");
            inv131.getItems().add(itm1);

            SalesInvoiceItem itm2 = new SalesInvoiceItem();
            itm2.setItemDescription("DUAL STAGE REGULATORS NITROGEN");
            itm2.setUnit("01 Nos");
            itm2.setQty(1.0);
            itm2.setCapacity(1.0);
            itm2.setRatePer("Nos");
            itm2.setRate(12450.0);
            itm2.setAmount(12450.0);
            itm2.setHsn("84818030");
            inv131.getItems().add(itm2);

            SalesInvoiceItem itm3 = new SalesInvoiceItem();
            itm3.setItemDescription("DUAL STAGE REGULATORS CARBON DIOXIDE");
            itm3.setUnit("01 Nos");
            itm3.setQty(1.0);
            itm3.setCapacity(1.0);
            itm3.setRatePer("Nos");
            itm3.setRate(12450.0);
            itm3.setAmount(12450.0);
            itm3.setHsn("84818030");
            inv131.getItems().add(itm3);

            salesInvoiceRepository.save(inv131);
            System.out.println("Invoice 131 seeded successfully!");
        }

        // ── Ensure Invoice 132 exists (Techknowgreen Solution Limited - Helium Gas) ──
        if (salesInvoiceRepository.findAll().stream().noneMatch(s -> "132".equals(s.getInvoiceNo()))) {
            SalesInvoice inv132 = new SalesInvoice();
            inv132.setSalesAc("SALES ACCOUNT - MATERIAL");
            inv132.setInvoiceNo("132");
            inv132.setInvoiceDate(LocalDate.of(2026, 8, 22));
            inv132.setInvoiceType("REGULAR");
            inv132.setTaxType("GST LOCAL");
            inv132.setGstType("Sales Taxable");
            inv132.setCustomerName("Techknowgreen Solution Limited.");
            inv132.setCustomerLocation("DEFAULT ADDRESS");
            inv132.setCustomerAddress("202, Hem Opal, Plot No.26 Near Joshi Wadewale Lane,\nEkta Society, Wakdewadi Pune-411005");
            inv132.setCustomerGstNo("27AAJCT9287E1ZR");
            inv132.setVehicleNo("MH14MS1129");
            inv132.setVendorCode("");
            inv132.setPoNo("262711269");
            inv132.setPoDate(LocalDate.of(2026, 8, 4));
            inv132.setChNo("234");
            inv132.setChDate(LocalDate.of(2026, 8, 19));
            inv132.setCrDays(30);
            inv132.setDueDate(LocalDate.of(2026, 9, 21));
            inv132.setGrossTotal(67200.0);
            inv132.setDiscount(0.0);
            inv132.setPf(0.0);
            inv132.setFreight(0.0);
            inv132.setOther(0.0);
            inv132.setCgst(6048.0);
            inv132.setSgst(6048.0);
            inv132.setIgst(0.0);
            inv132.setRoundOff(0.0);
            inv132.setNetTotal(79296.0);
            inv132.setTotalQty(2.0);
            inv132.setFinancialYearId("2025-2026");

            SalesInvoiceItem heliumItem = new SalesInvoiceItem();
            heliumItem.setItemDescription("HELIUM GAS");
            heliumItem.setUnit("02 Nos");
            heliumItem.setQty(2.0);
            heliumItem.setCapacity(1.0);
            heliumItem.setOurCyl(2);
            heliumItem.setPartyCyl(0);
            heliumItem.setRatePer("Nos");
            heliumItem.setRate(33600.0);
            heliumItem.setAmount(67200.0);
            heliumItem.setHsn("28042910");
            inv132.getItems().add(heliumItem);

            salesInvoiceRepository.save(inv132);
            System.out.println("Invoice 132 (Techknowgreen / HELIUM GAS) seeded successfully!");
        }

        // ── Ensure Invoice 133 exists (Techknowgreen Solution Limited - Transport charge) ──
        if (salesInvoiceRepository.findAll().stream().noneMatch(s -> "133".equals(s.getInvoiceNo()))) {
            SalesInvoice inv133 = new SalesInvoice();
            inv133.setSalesAc("SALES ACCOUNT - MATERIAL");
            inv133.setInvoiceNo("133");
            inv133.setInvoiceDate(LocalDate.of(2026, 8, 22));
            inv133.setInvoiceType("REGULAR");
            inv133.setTaxType("GST LOCAL");
            inv133.setGstType("Sales Taxable");
            inv133.setCustomerName("Techknowgreen Solution Limited.");
            inv133.setCustomerLocation("DEFAULT ADDRESS");
            inv133.setCustomerAddress("202, Hem Opal, Plot No.26 Near Joshi Wadewale Lane,\nEkta Society, Wakdewadi Pune-411005");
            inv133.setCustomerGstNo("27AAJCT9287E1ZR");
            inv133.setVehicleNo("MH14MS1129");
            inv133.setVendorCode("");
            inv133.setPoNo("");
            inv133.setPoDate(null);
            inv133.setChNo("234");
            inv133.setChDate(LocalDate.of(2026, 8, 22));
            inv133.setCrDays(30);
            inv133.setDueDate(LocalDate.of(2026, 9, 21));
            inv133.setGrossTotal(1000.0);
            inv133.setDiscount(0.0);
            inv133.setPf(0.0);
            inv133.setFreight(0.0);
            inv133.setOther(0.0);
            inv133.setCgst(90.0);
            inv133.setSgst(90.0);
            inv133.setIgst(0.0);
            inv133.setRoundOff(0.0);
            inv133.setNetTotal(1180.0);
            inv133.setTotalQty(1.0);
            inv133.setFinancialYearId("2025-2026");

            SalesInvoiceItem transportItem = new SalesInvoiceItem();
            transportItem.setItemDescription("Transport charge");
            transportItem.setUnit("Nos");
            transportItem.setQty(1.0);
            transportItem.setCapacity(1.0);
            transportItem.setOurCyl(0);
            transportItem.setPartyCyl(0);
            transportItem.setRatePer("Nos");
            transportItem.setRate(1000.0);
            transportItem.setAmount(1000.0);
            transportItem.setHsn("9967");
            inv133.getItems().add(transportItem);

            salesInvoiceRepository.save(inv133);
            System.out.println("Invoice 133 (Techknowgreen / Transport charge) seeded successfully!");
        }

        // ── Ensure Invoice 153 exists (Thermax Limited - SS, Single stage Pressure Regulator) ──
        try {
            if (salesInvoiceRepository.findAll().stream().noneMatch(s -> "153".equals(s.getInvoiceNo()))) {
                SalesInvoice inv153 = new SalesInvoice();
                inv153.setSalesAc("SALES ACCOUNT - MATERIAL");
                inv153.setInvoiceNo("153");
                inv153.setInvoiceDate(LocalDate.of(2026, 9, 12));
                inv153.setInvoiceType("REGULAR");
                inv153.setTaxType("GST LOCAL");
                inv153.setGstType("Sales Taxable");
                inv153.setCustomerName("Thermax Limited");
                inv153.setCustomerLocation("DEFAULT ADDRESS");
                inv153.setCustomerAddress("D-13,-R.D.Age Road,MIDC,\nChinchwad-Pune-411019");
                inv153.setCustomerGstNo("27AAACT3910D1ZS");
                inv153.setVehicleNo("MH14KG8157");
                inv153.setVendorCode("169197");
                inv153.setPoNo("5510849");
                inv153.setPoDate(LocalDate.of(2026, 9, 7));
                inv153.setChNo("N/A");
                inv153.setCrDays(30);
                inv153.setDueDate(LocalDate.of(2026, 10, 12));
                inv153.setGrossTotal(18750.0);
                inv153.setDiscount(0.0);
                inv153.setPf(0.0);
                inv153.setFreight(0.0);
                inv153.setOther(0.0);
                inv153.setCgst(1687.50);
                inv153.setSgst(1687.50);
                inv153.setIgst(0.0);
                inv153.setRoundOff(0.0);
                inv153.setNetTotal(22125.0);
                inv153.setTotalQty(1.0);
                inv153.setFinancialYearId("2025-2026");

                SalesInvoiceItem regItem = new SalesInvoiceItem();
                regItem.setItemDescription("SS, Single stage Pressure Regulator with Preheater and Rotatmeter - Gas : Co2");
                regItem.setUnit("01 Nos");
                regItem.setQty(1.0);
                regItem.setCapacity(1.0);
                regItem.setOurCyl(0);
                regItem.setPartyCyl(0);
                regItem.setRatePer("Nos");
                regItem.setRate(18750.0);
                regItem.setAmount(18750.0);
                regItem.setHsn("9032");
                inv153.getItems().add(regItem);

                salesInvoiceRepository.save(inv153);
                System.out.println("Invoice 153 (Thermax Limited / SS Pressure Regulator) seeded successfully!");
            }
        } catch (Exception e) {
            System.err.println("Invoice 153 seed error (non-fatal): " + e.getMessage());
        }
    }
}
