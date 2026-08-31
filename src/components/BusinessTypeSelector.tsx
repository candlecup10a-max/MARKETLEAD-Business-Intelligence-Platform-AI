import React, { useState, useMemo, useRef } from 'react';
import {
  Upload,
  Plus,
  Search,
  CheckCircle2,
  Building2,
  Globe2,
  MapPin,
  Flame,
  ArrowRight,
  Download,
  Filter,
  Sparkles,
  FileText,
  AlertCircle
} from 'lucide-react';
import { BusinessType, BusinessMode, PopularityLevel } from '../types';
import { parseCSV, RAW_DEFAULT_CSV } from '../data/defaultBusinessTypes';

interface BusinessTypeSelectorProps {
  businessTypes: BusinessType[];
  selectedBusinessType: BusinessType | null;
  onSelectBusinessType: (bt: BusinessType) => void;
  onAddCustomBusinessType: (bt: BusinessType) => void;
  onImportCSV: (newTypes: BusinessType[]) => void;
  onOpenCompanyPage: (bt: BusinessType) => void;
}

export const BusinessTypeSelector: React.FC<BusinessTypeSelectorProps> = ({
  businessTypes,
  selectedBusinessType,
  onSelectBusinessType,
  onAddCustomBusinessType,
  onImportCSV,
  onOpenCompanyPage,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMode, setSelectedMode] = useState<string>('All');
  const [selectedPopularity, setSelectedPopularity] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [importNotification, setImportNotification] = useState<string | null>(null);

  // New Custom Business Type Form State
  const [newName, setNewName] = useState('');
  const [newMode, setNewMode] = useState<BusinessMode>('Hybrid');
  const [newPlace, setNewPlace] = useState('Business Center');
  const [newArea, setNewArea] = useState('200 m2');
  const [newPopularity, setNewPopularity] = useState<PopularityLevel>('High');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtered List
  const filteredList = useMemo(() => {
    return businessTypes.filter((bt) => {
      const matchSearch =
        bt.business_type_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bt.place.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bt.business_id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchMode = selectedMode === 'All' || bt.online_or_onsite === selectedMode;
      const matchPop = selectedPopularity === 'All' || bt.popularity === selectedPopularity;

      return matchSearch && matchMode && matchPop;
    });
  }, [businessTypes, searchTerm, selectedMode, selectedPopularity]);

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        const parsed = parseCSV(text);
        if (parsed.length > 0) {
          onImportCSV(parsed);
          setImportNotification(`Successfully imported ${parsed.length} business types from ${file.name}!`);
          setTimeout(() => setImportNotification(null), 4500);
        } else {
          setImportNotification('Could not parse valid business types from the uploaded CSV.');
          setTimeout(() => setImportNotification(null), 4500);
        }
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const customType: BusinessType = {
      business_id: `BUS-${String(businessTypes.length + 1).padStart(4, '0')}`,
      business_type_name: newName.trim(),
      online_or_onsite: newMode,
      place: newPlace.trim() || 'Commercial Area',
      approximately_area: newArea.trim() || '100 m2',
      popularity: newPopularity,
      isCustom: true,
    };

    onAddCustomBusinessType(customType);
    onSelectBusinessType(customType);
    setNewName('');
    setShowAddModal(false);
    setImportNotification(`Added custom business type "${customType.business_type_name}"!`);
    setTimeout(() => setImportNotification(null), 4500);
  };

  const exportCurrentCSV = () => {
    const header = 'business_id,business_type_name,online_or_onsite,place,approximately_area,popularity\n';
    const rows = businessTypes
      .map(
        (b) =>
          `"${b.business_id}","${b.business_type_name}","${b.online_or_onsite}","${b.place}","${b.approximately_area}","${b.popularity}"`
      )
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `business_types_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & CSV Uploader */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CSV Dropzone / Uploader */}
        <div
          id="csv-upload-dropzone"
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative col-span-1 lg:col-span-2 rounded-2xl border-2 border-dashed p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 shadow-sm ${
            dragOver
              ? 'border-teal-500 bg-teal-50/70 scale-[1.01]'
              : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />
          <div className="h-12 w-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center mb-3 border border-teal-100">
            <Upload className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Upload CSV File as Business Types
          </h3>
          <p className="text-xs text-slate-500 max-w-md mb-3">
            Drag and drop your custom business types <code className="text-teal-700 bg-teal-50 px-1 py-0.5 rounded font-mono">.csv</code> file here or click to browse. Supports custom categories, locations, areas, and modes.
          </p>
          <div className="flex items-center space-x-2 text-[11px] text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            <FileText className="h-3.5 w-3.5 text-teal-600" />
            <span>Preloaded with 501 rich industrial & service categories</span>
          </div>
        </div>

        {/* Quick Stats & Actions Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Catalog Summary</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                {businessTypes.length} Total Types
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                <span className="text-slate-500">Online Categories:</span>
                <span className="font-semibold text-slate-800">
                  {businessTypes.filter((b) => b.online_or_onsite === 'Online').length}
                </span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                <span className="text-slate-500">Onsite Categories:</span>
                <span className="font-semibold text-slate-800">
                  {businessTypes.filter((b) => b.online_or_onsite === 'Onsite').length}
                </span>
              </div>
              <div className="flex justify-between text-xs py-1 border-b border-slate-100">
                <span className="text-slate-500">Hybrid Categories:</span>
                <span className="font-semibold text-slate-800">
                  {businessTypes.filter((b) => b.online_or_onsite === 'Hybrid').length}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              id="add-manual-business-type-btn"
              onClick={() => setShowAddModal(true)}
              className="flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add Custom Category</span>
            </button>
            <button
              id="export-csv-btn"
              onClick={exportCurrentCSV}
              className="flex items-center justify-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-medium border border-slate-200 transition-colors"
              title="Download CSV"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {/* Notification Banner */}
      {importNotification && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl flex items-center space-x-2 text-xs animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          <span>{importNotification}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="search-business-types-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search category, location, ID (e.g. 3D Printing, Cloud)..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
            />
          </div>

          {/* Mode & Popularity Filter Badges */}
          <div className="flex flex-wrap gap-2 items-center w-full md:w-auto">
            <div className="flex items-center space-x-1 bg-slate-50 px-2 py-1 rounded-xl border border-slate-200 text-xs">
              <Filter className="h-3.5 w-3.5 text-slate-500 mr-1" />
              <span className="text-[11px] text-slate-500">Mode:</span>
              {(['All', 'Online', 'Onsite', 'Hybrid'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMode(m)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                    selectedMode === m
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <div className="flex items-center space-x-1 bg-slate-50 px-2 py-1 rounded-xl border border-slate-200 text-xs">
              <Flame className="h-3.5 w-3.5 text-amber-500 mr-1" />
              <span className="text-[11px] text-slate-500">Popularity:</span>
              {(['All', 'Very High', 'High', 'Medium', 'Low'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPopularity(p)}
                  className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-colors ${
                    selectedPopularity === p
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Business Types Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredList.map((bt) => {
          const isSelected = selectedBusinessType?.business_id === bt.business_id;

          return (
            <div
              key={bt.business_id}
              id={`business-card-${bt.business_id}`}
              className={`rounded-2xl p-4 transition-all duration-200 flex flex-col justify-between border shadow-sm ${
                isSelected
                  ? 'bg-teal-50/50 border-teal-500 ring-1 ring-teal-500'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div>
                {/* Header Tag */}
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                    {bt.business_id}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        bt.online_or_onsite === 'Online'
                          ? 'bg-teal-50 text-teal-700 border border-teal-200'
                          : bt.online_or_onsite === 'Onsite'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-purple-50 text-purple-700 border border-purple-200'
                      }`}
                    >
                      {bt.online_or_onsite}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        bt.popularity === 'Very High'
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : bt.popularity === 'High'
                          ? 'bg-slate-100 text-slate-700 border border-slate-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {bt.popularity}
                    </span>
                  </div>
                </div>

                {/* Business Title */}
                <h4 className="text-sm font-bold text-slate-900 mb-2 leading-snug line-clamp-2">
                  {bt.business_type_name}
                </h4>

                {/* Location / Area Specs */}
                <div className="space-y-1 text-xs text-slate-500 mb-4">
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                    <span className="truncate">{bt.place}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                    <span>Approx. {bt.approximately_area}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                <button
                  id={`select-bt-${bt.business_id}`}
                  onClick={() => onSelectBusinessType(bt)}
                  className={`flex-1 flex items-center justify-center space-x-1.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {isSelected ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Active Category</span>
                    </>
                  ) : (
                    <span>Select Category</span>
                  )}
                </button>

                <button
                  id={`setup-company-${bt.business_id}`}
                  onClick={() => onOpenCompanyPage(bt)}
                  className="px-2.5 py-1.5 bg-teal-50 hover:bg-teal-600 text-teal-700 hover:text-white rounded-xl text-xs font-semibold border border-teal-200 hover:border-transparent transition-colors flex items-center space-x-1"
                  title="Create Company Page for this category"
                >
                  <Building2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Company Page</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredList.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <AlertCircle className="h-10 w-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 mb-1">No Business Categories Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Try adjusting your search keywords or filters, or add a custom business type manually.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedMode('All');
              setSelectedPopularity('All');
            }}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Add Custom Business Type Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Plus className="h-5 w-5 text-teal-600" />
                <h3 className="text-sm font-bold text-slate-900">Add Custom Business Type</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-mono p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualAdd} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Business Type Name *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. AI Prompt Engineering Agency, Solar Drone Inspector"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Operating Mode
                  </label>
                  <select
                    value={newMode}
                    onChange={(e) => setNewMode(e.target.value as BusinessMode)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                  >
                    <option value="Hybrid">Hybrid</option>
                    <option value="Online">Online</option>
                    <option value="Onsite">Onsite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Market Popularity
                  </label>
                  <select
                    value={newPopularity}
                    onChange={(e) => setNewPopularity(e.target.value as PopularityLevel)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                  >
                    <option value="Very High">Very High</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Typical Location / Facility Type
                </label>
                <input
                  type="text"
                  value={newPlace}
                  onChange={(e) => setNewPlace(e.target.value)}
                  placeholder="e.g. Business Center, First Floor, Virtual / Cloud"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Approximate Area / Footprint
                </label>
                <input
                  type="text"
                  value={newArea}
                  onChange={(e) => setNewArea(e.target.value)}
                  placeholder="e.g. 150 m2 or 0 m2 (Virtual)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                >
                  Save & Select
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
