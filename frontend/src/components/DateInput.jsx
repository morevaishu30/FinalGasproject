import React, { useState, useEffect, useRef } from 'react';

/**
 * Formats any date string (ISO, timestamp, etc.) to DD/MM/YYYY format.
 */
export const formatDateToDDMMYYYY = (dateStr) => {
  if (!dateStr) return '';
  const str = String(dateStr).trim();
  if (!str) return '';

  // Already DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    return str;
  }

  // YYYY-MM-DD (or with time ISO)
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const parts = str.split('T')[0].split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts;
      return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
    }
  }

  // Try parsing date
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const d = String(parsed.getDate()).padStart(2, '0');
    const m = String(parsed.getMonth() + 1).padStart(2, '0');
    const y = parsed.getFullYear();
    return `${d}/${m}/${y}`;
  }

  return str;
};

/**
 * Parses DD/MM/YYYY or DD-MM-YYYY string to YYYY-MM-DD format for backend/state storage.
 */
export const parseToYYYYMMDD = (val) => {
  if (!val) return '';
  const str = String(val).trim();
  if (!str) return '';

  // If already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const parts = str.split(/[-/]/);
  if (parts.length === 3) {
    let [d, m, y] = parts;
    if (y.length === 2) y = '20' + y;
    d = d.padStart(2, '0');
    m = m.padStart(2, '0');
    if (
      y.length === 4 &&
      parseInt(m, 10) >= 1 &&
      parseInt(m, 10) <= 12 &&
      parseInt(d, 10) >= 1 &&
      parseInt(d, 10) <= 31
    ) {
      return `${y}-${m}-${d}`;
    }
  }

  return str;
};

/**
 * DateInput component supporting DD/MM/YYYY text display and editing,
 * plus a native popup calendar picker for easy selection.
 */
const DateInput = ({
  name,
  value,
  onChange,
  readOnly = false,
  disabled = false,
  className = '',
  style = {},
  placeholder = 'DD/MM/YYYY',
  required = false
}) => {
  const [displayText, setDisplayText] = useState(() => formatDateToDDMMYYYY(value));
  const hiddenPickerRef = useRef(null);

  useEffect(() => {
    setDisplayText(formatDateToDDMMYYYY(value));
  }, [value]);

  const handleTextChange = (e) => {
    const raw = e.target.value;
    setDisplayText(raw);

    // Auto convert if full valid DD/MM/YYYY
    const parts = raw.split(/[-/]/);
    if (parts.length === 3) {
      const [d, m, y] = parts;
      if (d.length === 2 && m.length === 2 && y.length === 4) {
        const day = parseInt(d, 10);
        const month = parseInt(m, 10);
        const year = parseInt(y, 10);
        if (month >= 1 && month <= 12 && day >= 1 && day <= 31 && year >= 1900 && year <= 2100) {
          const iso = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
          if (onChange) {
            onChange({ target: { name, value: iso } });
          }
        }
      }
    } else if (raw === '') {
      if (onChange) {
        onChange({ target: { name, value: '' } });
      }
    }
  };

  const handleBlur = () => {
    if (!displayText || !displayText.trim()) {
      if (onChange) onChange({ target: { name, value: '' } });
      setDisplayText('');
      return;
    }

    const iso = parseToYYYYMMDD(displayText);
    if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      if (onChange) onChange({ target: { name, value: iso } });
      setDisplayText(formatDateToDDMMYYYY(iso));
    } else {
      setDisplayText(formatDateToDDMMYYYY(value));
    }
  };

  const handlePickerChange = (e) => {
    const pickerVal = e.target.value; // Format: YYYY-MM-DD
    if (onChange) {
      onChange({ target: { name, value: pickerVal } });
    }
    setDisplayText(formatDateToDDMMYYYY(pickerVal));
  };

  const openCalendar = (e) => {
    e.stopPropagation();
    if (!readOnly && !disabled && hiddenPickerRef.current) {
      try {
        if (typeof hiddenPickerRef.current.showPicker === 'function') {
          hiddenPickerRef.current.showPicker();
        } else {
          hiddenPickerRef.current.focus();
        }
      } catch (err) {
        hiddenPickerRef.current.focus();
      }
    }
  };

  const pickerValue = (() => {
    if (!value) return '';
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return value.split('T')[0];
    return parseToYYYYMMDD(value);
  })();

  return (
    <div className="relative inline-flex items-center" style={style}>
      <input
        type="text"
        name={name}
        value={displayText}
        onChange={readOnly || disabled ? undefined : handleTextChange}
        onBlur={readOnly || disabled ? undefined : handleBlur}
        readOnly={readOnly}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        className={`${className} ${!readOnly && !disabled ? 'pr-5' : ''}`}
      />
      {!readOnly && !disabled && (
        <button
          type="button"
          tabIndex={-1}
          onClick={openCalendar}
          title="Pick date"
          className="absolute right-1 text-gray-500 hover:text-blue-700 cursor-pointer text-[10px] select-none p-0 bg-transparent border-none flex items-center justify-center"
        >
          📅
        </button>
      )}
      {!readOnly && !disabled && (
        <input
          ref={hiddenPickerRef}
          type="date"
          tabIndex={-1}
          value={pickerValue}
          onChange={handlePickerChange}
          className="sr-only opacity-0 absolute pointer-events-none -z-10"
        />
      )}
    </div>
  );
};

export default DateInput;
