import React, { useState } from "react";
import { Link } from "react-router-dom";

const menuData = [
  {
    name: "Administration Setup",
    children: [
      { name: "Manage Financial Year", action: "changeFY" }
    ]
  },
  {
    name: "Master",
    children: [
      {
        name: "Person Detail Master",
        children: [{ name: "Person Details", path: "/person-details" }]
      },
      {
        name: "Account Book Master",
        children: [
          { name: "Customer Ledger A/c", path: "/customer-ledger" },
          { name: "Supplier Ledger A/c", path: "/supplier-ledger" }
        ]
      },
      {
        name: "Inventories / Item Master",
        children: [
          { name: "Item Details", path: "/item-master" },
          { name: "Cylinder Master", path: "/cylinder-master" }
        ]
      },
      {
        name: "Rate Master",
        children: [{ name: "Rates", path: "/rate-master" }]
      }
    ]
  },
  {
    name: "Transaction",
    path: "/transaction"
  },
  {
    name: "Report",
    path: "/report"
  }
];

const MenuItem = ({ item, onAction, mobile }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!item.children) {
    return (
      <Link
        to={item.path || "#"}
        onClick={() => {
          if (item.action && onAction) onAction(item.action);
        }}
        className={`block text-left w-full ${mobile ? 'px-4 py-3 text-base text-white hover:bg-white/10 border-b border-white/5' : 'px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700'} transition-colors`}
      >
        {item.name}
      </Link>
    );
  }

  return (
    <div 
      className={`relative group/item ${mobile ? 'border-b border-white/5' : ''}`}
      onMouseEnter={() => !mobile && setIsOpen(true)}
      onMouseLeave={() => !mobile && setIsOpen(false)}
    >
      <button 
        onClick={() => mobile && setIsOpen(!isOpen)}
        className={`flex items-center justify-between w-full font-medium ${mobile ? 'px-4 py-3 text-base text-white hover:bg-white/10' : 'px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700'} transition-colors`}
      >
        <span>{item.name}</span>
        <span className="ml-2 text-xs opacity-70">▶</span>
      </button>
      <div className={`${mobile ? (isOpen ? 'block bg-blue-900/50 pl-4' : 'hidden') : `absolute left-full top-0 w-60 bg-white border border-gray-100 shadow-xl rounded-lg z-50 overflow-hidden transform origin-top-left transition-all duration-200 ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}`}>
        {item.children.map((child, idx) => (
          <MenuItem key={idx} item={child} onAction={onAction} mobile={mobile} />
        ))}
      </div>
    </div>
  );
};

const Navbar = ({ currentFY, onChangeFY, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white shadow-xl relative z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 font-extrabold text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-100 drop-shadow-md mr-10">
              GAS SYSTEM
            </Link>
            
            <div className="hidden md:flex space-x-1">
              {menuData.map((menu, idx) => (
                <div key={idx} className="relative group">
                  {menu.children ? (
                    <>
                      <button className="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/10 hover:shadow-inner transition-all duration-300 focus:outline-none flex items-center">
                        {menu.name}
                        <svg className="w-4 h-4 ml-1 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                      </button>
                      <div className="absolute left-0 mt-2 w-60 bg-white border border-gray-100 shadow-2xl rounded-xl z-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top -translate-y-2 group-hover:translate-y-0 py-1">
                        {menu.children.map((child, cIdx) => (
                          <MenuItem key={cIdx} item={child} onAction={onChangeFY} mobile={false} />
                        ))}
                      </div>
                    </>
                  ) : (
                    <Link 
                      to={menu.path}
                      className="px-4 py-2 rounded-lg text-sm font-semibold hover:bg-white/10 hover:shadow-inner transition-all duration-300 focus:outline-none block inline-flex"
                    >
                      {menu.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="bg-white/10 px-4 py-1.5 rounded-full text-xs font-semibold border border-white/20 shadow-inner backdrop-blur-sm cursor-pointer hover:bg-white/20 transition" onClick={() => onChangeFY('changeFY')}>
              <span className="text-blue-200 mr-2">FY:</span>
              <span className="text-white">{currentFY || "Not Selected"}</span>
            </div>
            <button onClick={onLogout} className="bg-red-500/80 hover:bg-red-600 text-white px-4 py-1.5 rounded-full text-xs font-bold transition shadow">
              Logout
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-white hover:bg-white/10 focus:outline-none transition-colors"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden absolute w-full bg-[#1e3a8a] border-t border-blue-800/50 shadow-2xl transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-screen overflow-y-auto block' : 'max-h-0 invisible'}`}>
        <div className="py-2 flex flex-col">
          {menuData.map((menu, idx) => (
            <MenuItem key={idx} item={menu} onAction={onChangeFY} mobile={true} />
          ))}
        </div>
        <div className="p-4 border-t border-white/10 flex justify-between items-center bg-blue-900/50">
          <div className="bg-white/10 px-4 py-2 rounded-lg text-sm font-semibold border border-white/20 text-center" onClick={() => onChangeFY('changeFY')}>
            <span className="text-blue-300">FY: </span>
            <span className="text-white">{currentFY || "Not Selected"}</span>
          </div>
          <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

