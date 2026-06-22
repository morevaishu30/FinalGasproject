const fs = require('fs');

const file = 'frontend/src/pages/CylinderMaster.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replace initialFormState
content = content.replace(/const initialFormState = {[\s\S]*?};\n/, `const initialFormState = {
    cylinderOriginalNo: "", cylinderOwnership: "shivshakti",
    cylRotationNo: "",
    make: "", itemGrade: "HYDROGEN", cylinderType: "4.5 LTR W.C ALU CYLINDER",
    bodyType: "", capacity: "1.000", useIn: "Trd.",
    importedCylinder: false, cylinderStatus: "U-In Used",
    
    // Purchase Details
    pBillNo: "", pBillDate: "",
    pSupplierName: "", pEcrNo: "", pRate: "0.00"
  };\n`);

// Update layout col-span
content = content.replace(/<div className="col-span-8 space-y-2">/g, '<div className="col-span-12 max-w-4xl mx-auto space-y-2">');

// Remove Mode Radio buttons
content = content.replace(/<div className="col-span-5 flex items-center justify-center gap-4">[\s\S]*?<\/div>\n/, '<div className="col-span-5"></div>\n');

// Update cylinderOwnership options
content = content.replace(/<select name="cylinderOwnership"([\s\S]*?)<\/select>/, `<select name="cylinderOwnership"$1\n                  <option value="shivshakti">shivshakti</option>\n                  <option value="VADILAL CHEMICALS LTD - POR">VADILAL CHEMICALS LTD - POR</option>\n                  <option value="VADILAL GASES LTD">VADILAL GASES LTD</option>\n                </select>`);

// Remove Customer Prefix and adjust Cyl Rotation No
content = content.replace(/<label className="col-span-3 text-right font-semibold">Customer Prefix :<\/label>[\s\S]*?<label className="col-span-3 text-right font-semibold">Cyl. Rotation No :<\/label>\s*<div className="col-span-3">/, '<label className="col-span-3 text-right font-semibold">Cyl. Rotation No :</label>\n              <div className="col-span-9">');

// Remove Cylinder W.C Type block completely
content = content.replace(/<div className="grid grid-cols-12 gap-2 items-center">\s*<label className="col-span-3 text-right font-semibold">Cylinder W\.C Type :<\/label>[\s\S]*?<\/div>\n/, '');

// Remove Hydro Test block completely
content = content.replace(/<div className="grid grid-cols-12 gap-1 items-center">\s*<label className="col-span-2 text-right font-semibold whitespace-nowrap">Hydro Test Days :<\/label>[\s\S]*?<\/div>\n/, '');

// Remove Tare Weight
content = content.replace(/<label className="col-span-2 text-right font-semibold">Tare Weight :<\/label>\s*<div className="col-span-3">\s*<input name="tareWeight"[\s\S]*?<\/div>/, '');

// Update cylinderStatus div to take more space now that Tare Weight is gone
content = content.replace(/<div className="col-span-4">\s*<select name="cylinderStatus"/, '<div className="col-span-9">\n                <select name="cylinderStatus"');

// Remove Sales Detail Section
content = content.replace(/{\/\* Sales Detail Section \*\/}[\s\S]*?<\/div>\s*<\/div>\n/, '');

// Remove SKID Section
content = content.replace(/{\/\* Right Column - SKID and other info \(4 cols\) \*\/}[\s\S]*?<\/div>\n/, '');

fs.writeFileSync(file, content, 'utf8');
console.log('CylinderMaster.jsx updated successfully.');
