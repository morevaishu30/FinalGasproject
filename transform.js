const fs = require('fs');

const customerFile = 'frontend/src/pages/CustomerLedger.jsx';
const supplierFile = 'frontend/src/pages/SupplierLedger.jsx';

let content = fs.readFileSync(customerFile, 'utf8');

// Replace standard names
content = content.replace(/CustomerLedger/g, 'SupplierLedger');
content = content.replace(/\/customer-ledgers/g, '/supplier-ledgers');
content = content.replace(/Customer Ledger/g, 'Supplier Ledger');
content = content.replace(/customerName/g, 'supplierName');
content = content.replace(/Customer Name/g, 'Supplier Name');

// In initial state
content = content.replace(/accountType: "Sales Party"/g, 'accountType: "Purchase Party"');
content = content.replace(/underGroup: "SUNDRY DEBTORS FOR GOODS"/g, 'underGroup: "SUNDRY CREDITORS FOR GOODS"');

// The select options order for accountType
content = content.replace(
  /<option value="Sales Party">Sales Party<\/option>\s*<option value="Purchase Party">Purchase Party<\/option>/g,
  '<option value="Purchase Party">Purchase Party</option>\n                  <option value="Sales Party">Sales Party</option>'
);

// The select options order for underGroup
content = content.replace(
  /<option value="SUNDRY DEBTORS FOR GOODS">SUNDRY DEBTORS FOR GOODS<\/option>\s*<option value="SUNDRY CREDITORS FOR GOODS">SUNDRY CREDITORS FOR GOODS<\/option>/g,
  '<option value="SUNDRY CREDITORS FOR GOODS">SUNDRY CREDITORS FOR GOODS</option>\n                  <option value="SUNDRY DEBTORS FOR GOODS">SUNDRY DEBTORS FOR GOODS</option>'
);

fs.writeFileSync(supplierFile, content, 'utf8');
console.log('SupplierLedger.jsx updated successfully.');
