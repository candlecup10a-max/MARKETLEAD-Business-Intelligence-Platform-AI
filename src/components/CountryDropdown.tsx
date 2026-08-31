import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Globe, ChevronDown, Search, Check, X } from 'lucide-react';
import { Country, COUNTRIES, TOTAL_COUNTRIES_COUNT, findCountry } from '../data/countries';

interface CountryDropdownProps {
  id?: string;
  value?: string; // Can be country code ('US') or country name ('United States')
  onChange: (country: Country | null) => void;
  label?: string;
  placeholder?: string;
  showAllOption?: boolean;
  allOptionLabel?: string;
  showDialCode?: boolean;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
}

export const CountryDropdown: React.FC<CountryDropdownProps> = ({
  id = 'country-dropdown',
  value,
  onChange,
  label,
  placeholder = 'Select country (249 available)...',
  showAllOption = false,
  allOptionLabel = 'All 249 Countries',
  showDialCode = false,
  className = '',
  buttonClassName = '',
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isAllSelected = !value || value === 'All' || value.toLowerCase() === 'all' || value.toLowerCase() === 'all countries' || value.toLowerCase() === 'all 249 countries';

  // Find selected country from value safely
  const selectedCountry = useMemo(() => {
    if (isAllSelected) return null;
    return findCountry(value) || null;
  }, [value, isAllSelected]);

  // Filter countries by search query or region
  const filteredCountries = COUNTRIES.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.dialCode.includes(q) ||
      c.region.toLowerCase().includes(q)
    );
  });

  // Handle outside click to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input on open
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    } else {
      setSearchQuery('');
    }
  }, [isOpen]);

  const handleSelect = (country: Country | null) => {
    onChange(country);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
          <span className="flex items-center space-x-1">
            <Globe className="h-3 w-3 text-slate-500" />
            <span>{label}</span>
          </span>
          <span className="text-[10px] text-slate-400 font-normal">
            249 Countries
          </span>
        </label>
      )}

      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-3.5 py-2 bg-slate-50 hover:bg-slate-100/80 disabled:opacity-50 border border-slate-200 rounded-xl text-xs text-left text-slate-900 transition-all focus:outline-none focus:border-teal-600 focus:bg-white shadow-xs ${buttonClassName}`}
      >
        <div className="flex items-center space-x-2 truncate">
          {selectedCountry ? (
            <>
              <span className="text-base leading-none">{selectedCountry.flag}</span>
              <span className="font-semibold text-slate-900 truncate">
                {selectedCountry.name}
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                ({selectedCountry.code})
              </span>
              {showDialCode && (
                <span className="text-[10px] text-teal-600 font-mono font-medium ml-1">
                  {selectedCountry.dialCode}
                </span>
              )}
            </>
          ) : showAllOption && isAllSelected ? (
            <>
              <Globe className="h-3.5 w-3.5 text-teal-600 shrink-0" />
              <span className="font-semibold text-slate-900 truncate">{allOptionLabel}</span>
              <span className="text-[10px] text-slate-400 font-mono shrink-0">({TOTAL_COUNTRIES_COUNT})</span>
            </>
          ) : (
            <>
              <Globe className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="text-slate-400 truncate">{placeholder}</span>
            </>
          )}
        </div>

        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180 text-teal-600' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full min-w-[280px] bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Search Header */}
          <div className="p-2.5 border-b border-slate-200 bg-slate-50/80">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across 249 countries or dial code..."
                className="w-full pl-8 pr-7 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 px-1">
              <span>{filteredCountries.length} countries found</span>
              <span className="text-slate-400 font-mono">ISO 3166-1 (249 total)</span>
            </div>
          </div>

          {/* Country Options Scroll Area */}
          <div className="max-h-60 overflow-y-auto p-1.5 space-y-0.5 divide-y divide-slate-100">
            {showAllOption && (
              <button
                type="button"
                onClick={() => handleSelect(null)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors ${
                  isAllSelected
                    ? 'bg-teal-50 text-teal-800 font-bold'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-teal-600" />
                  <span>{allOptionLabel}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({TOTAL_COUNTRIES_COUNT})</span>
                </div>
                {isAllSelected && <Check className="h-3.5 w-3.5 text-teal-600" />}
              </button>
            )}

            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => {
                const isSelected =
                  !isAllSelected &&
                  (selectedCountry?.code === country.code ||
                    value?.toLowerCase() === country.code.toLowerCase() ||
                    value?.toLowerCase() === country.name.toLowerCase());

                return (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleSelect(country)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs text-left transition-colors ${
                      isSelected
                        ? 'bg-teal-50 text-teal-900 font-bold'
                        : 'hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 truncate">
                      <span className="text-base leading-none shrink-0">{country.flag}</span>
                      <span className="truncate">{country.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {country.code}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 ml-2">
                      <span className="text-[10px] text-slate-500 font-mono">
                        {country.dialCode}
                      </span>
                      {isSelected && <Check className="h-3.5 w-3.5 text-teal-600" />}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">
                No matching country found for "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
