import re

file_path = "frontend/src/pages/CylinderMaster.jsx"
with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. initialFormState
old_state = """  const initialFormState = {
    cylinderOriginalNo: "", cylinderOwnership: "VADILAL CHEMICALS LTD - POR",
    mode: "Cylinder", customerPrefix: "", cylRotationNo: "",
    make: "", itemGrade: "HYDROGEN", cylinderType: "4.5 LTR W.C ALU CYLINDER",
    bodyType: "", wcType: "", capacity: "1.000", useIn: "Trd.",
    importedCylinder: false, hydroTestDays: "1095", lastHdDate: "",
    hdReminderDays: "30", cylinderStatus: "U-In Used", tareWeight: "0.000",
    
    // Purchase Details
    pBillNo: "", pBillDate: "",
    pSupplierName: "", pEcrNo: "", pRate: "0.00",
    
    // Sales Details
    sBillNo: "", sBillDate: "", sCustomerName: "", sGdaNo: "", sRate: "0.00",
    
    // SKID Details
    skidCylinderNoUse: "",
    skidReCheck: false, skidCheckDate: "", lastHeatDate: "", lastPaintDate: ""
  };"""

new_state = """  const initialFormState = {
    cylinderOriginalNo: "", cylinderOwnership: "shivshakti",
    cylRotationNo: "",
    make: "", itemGrade: "HYDROGEN", cylinderType: "4.5 LTR W.C ALU CYLINDER",
    bodyType: "", capacity: "1.000", useIn: "Trd.",
    importedCylinder: false, cylinderStatus: "U-In Used",
    
    // Purchase Details
    pBillNo: "", pBillDate: "",
    pSupplierName: "", pEcrNo: "", pRate: "0.00"
  };"""

content = content.replace(old_state, new_state)

# 2. Main Details Width
content = content.replace('<div className="col-span-8 space-y-2">', '<div className="col-span-12 max-w-4xl mx-auto space-y-2">')

# 3. Mode Radio Buttons
mode_radio = """              <div className="col-span-5 flex items-center justify-center gap-4">
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="radio" name="mode" value="Cylinder" checked={formData.mode === "Cylinder"} onChange={handleChange} />
                  <span>Cylinder</span>
                </label>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input type="radio" name="mode" value="SKID" checked={formData.mode === "SKID"} onChange={handleChange} />
                  <span>SKID</span>
                </label>
              </div>"""
content = content.replace(mode_radio, '<div className="col-span-5"></div>')

# 4. cylinderOwnership default
ownership_old = """                <select name="cylinderOwnership" value={formData.cylinderOwnership} onChange={handleChange} className="w-full border border-gray-300 px-2 py-1 outline-none bg-white">
                  <option>VADILAL CHEMICALS LTD - POR</option>
                  <option>VADILAL GASES LTD</option>
                </select>"""
ownership_new = """                <select name="cylinderOwnership" value={formData.cylinderOwnership} onChange={handleChange} className="w-full border border-gray-300 px-2 py-1 outline-none bg-white">
                  <option value="shivshakti">shivshakti</option>
                  <option value="VADILAL CHEMICALS LTD - POR">VADILAL CHEMICALS LTD - POR</option>
                  <option value="VADILAL GASES LTD">VADILAL GASES LTD</option>
                </select>"""
content = content.replace(ownership_old, ownership_new)

# 5. Customer Prefix
customer_prefix = """            <div className="grid grid-cols-12 gap-2 items-center">
              <label className="col-span-3 text-right font-semibold">Customer Prefix :</label>
              <div className="col-span-3">
                <input name="customerPrefix" value={formData.customerPrefix} onChange={handleChange} className="w-full border border-gray-300 px-2 py-1" />
              </div>
              <label className="col-span-3 text-right font-semibold">Cyl. Rotation No :</label>
              <div className="col-span-3">
                <input name="cylRotationNo" value={formData.cylRotationNo} onChange={handleChange} className="w-full border border-gray-300 px-2 py-1" />
              </div>
            </div>"""
new_cyl_rotation = """            <div className="grid grid-cols-12 gap-2 items-center">
              <label className="col-span-3 text-right font-semibold">Cyl. Rotation No :</label>
              <div className="col-span-9">
                <input name="cylRotationNo" value={formData.cylRotationNo} onChange={handleChange} className="w-full border border-gray-300 px-2 py-1" />
              </div>
            </div>"""
content = content.replace(customer_prefix, new_cyl_rotation)

# 6. Cylinder W.C Type
wc_type = """            <div className="grid grid-cols-12 gap-2 items-center">
              <label className="col-span-3 text-right font-semibold">Cylinder W.C Type :</label>
              <div className="col-span-9">
                <select name="wcType" value={formData.wcType} onChange={handleChange} className="w-full border border-gray-300 px-2 py-1 bg-white">
                  <option value=""></option>
                </select>
              </div>
            </div>"""
content = content.replace(wc_type, "")

# 7. Hydro Test Days block
hydro_test = """            <div className="grid grid-cols-12 gap-1 items-center">
              <label className="col-span-2 text-right font-semibold whitespace-nowrap">Hydro Test Days :</label>
              <div className="col-span-2">
                <input name="hydroTestDays" value={formData.hydroTestDays} onChange={handleChange} className="w-full border border-gray-300 px-2 py-1" />
              </div>
              <label className="col-span-2 text-right font-semibold whitespace-nowrap">Last HD Date :</label>
              <div className="col-span-3">
                <input type="date" name="lastHdDate" value={formData.lastHdDate} onChange={handleChange} className="w-full border border-gray-300 px-2 py-0.5" />
              </div>
              <label className="col-span-2 text-right font-semibold whitespace-nowrap">H.D Reminder Days :</label>
              <div className="col-span-1">
                <input name="hdReminderDays" value={formData.hdReminderDays} onChange={handleChange} className="w-full border border-gray-300 px-2 py-1" />
              </div>
            </div>"""
content = content.replace(hydro_test, "")

# 8. Tare Weight and Status
status_tare = """            <div className="grid grid-cols-12 gap-2 items-center">
              <label className="col-span-3 text-right font-semibold">Cylinder Status :</label>
              <div className="col-span-4">
                <select name="cylinderStatus" value={formData.cylinderStatus} onChange={handleChange} className="w-full border border-gray-300 px-2 py-1 bg-white text-blue-800">
                  <option>U-In Used</option>
                  <option>Broken</option>
                  <option>Scrap</option>
                </select>
              </div>
              <label className="col-span-2 text-right font-semibold">Tare Weight :</label>
              <div className="col-span-3">
                <input name="tareWeight" value={formData.tareWeight} onChange={handleChange} className="w-full border border-gray-300 px-2 py-1 text-right" />
              </div>
            </div>"""
new_status = """            <div className="grid grid-cols-12 gap-2 items-center">
              <label className="col-span-3 text-right font-semibold">Cylinder Status :</label>
              <div className="col-span-9">
                <select name="cylinderStatus" value={formData.cylinderStatus} onChange={handleChange} className="w-full border border-gray-300 px-2 py-1 bg-white text-blue-800">
                  <option>U-In Used</option>
                  <option>Broken</option>
                  <option>Scrap</option>
                </select>
              </div>
            </div>"""
content = content.replace(status_tare, new_status)

# 9. Cylinder Sales Detail block
sales_detail_regex = re.compile(r"\{\/\* Sales Detail Section \*\/\}[\s\S]*?<\/div>\s*<\/div>", re.MULTILINE)
content = sales_detail_regex.sub("", content)

# 10. SKID Right Column
skid_regex = re.compile(r"\{\/\* Right Column - SKID and other info \(4 cols\) \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*<\/div>", re.MULTILINE)
content = skid_regex.sub("          </div>", content)

# Final cleanup of multiple blank lines
content = re.sub(r'\n\s*\n\s*\n', '\n\n', content)

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("CylinderMaster.jsx processed by Python.")
