import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Trash2, Save, X, Calendar, TrendingUp } from 'lucide-react';

interface FPO {
  fpo_id: number;
  name: string;
  state_code: number;
  district_code: number;
}

interface CommodityEntry {
  commodity: string;
  volume_tonnes: number;
  turnover: number;
}

const COMMODITIES = ['Input', 'Cotton', 'Maize', 'Wheat', 'Rice', 'Soybean', 'Pulses', 'Vegetables', 'Fruits', 'Other'];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const Agribusiness: React.FC = () => {
  const { user } = useAuth();
  const [month, setMonth] = useState('');
  const [fyYear, setFyYear] = useState('');
  const [fpoList, setFpoList] = useState<FPO[]>([]);
  const [selectedFPO, setSelectedFPO] = useState<FPO | null>(null);
  const [entries, setEntries] = useState<CommodityEntry[]>([
    { commodity: '', volume_tonnes: 0, turnover: 0 }
  ]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleSubmitPeriod = async () => {
    if (!month || !fyYear) {
      toast.error('Please select both month and financial year');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      const response = await axios.get('http://localhost:5000/agri_business', { headers });
      setFpoList(response.data);
      console.log('Fetched FPOs:', response.data);
      setShowModal(true);
      toast.success('FPO list loaded successfully');
    } catch (error) {
      console.error('Error fetching FPOs:', error);
      toast.error('Failed to load FPO list');
    } finally {
      setLoading(false);
    }
  };

  const handleFPOSelect = (fpo: FPO) => {
    setSelectedFPO(fpo);
    toast.success(`Selected: ${fpo.name}`);
  };

  const addEntry = () => {
    setEntries([...entries, { commodity: '', volume_tonnes: 0, turnover: 0 }]);
  };

  const removeEntry = (index: number) => {
    if (entries.length > 1) {
      const newEntries = entries.filter((_, i) => i !== index);
      setEntries(newEntries);
    } else {
      toast.error('At least one entry is required');
    }
  };

  const updateEntry = (index: number, field: keyof CommodityEntry, value: string | number) => {
    const newEntries = [...entries];
    newEntries[index] = {
      ...newEntries[index],
      [field]: value
    };
    setEntries(newEntries);
  };

  const handleSubmitData = async () => {
    if (!selectedFPO) {
      toast.error('Please select an FPO');
      return;
    }

    const invalidEntries = entries.filter(
      entry => !entry.commodity || entry.volume_tonnes <= 0 || entry.turnover <= 0
    );

    if (invalidEntries.length > 0) {
      toast.error('Please fill all fields with valid values');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      const promises = entries.map(entry =>
        axios.post('http://localhost:5000/agri_business', {
          fpo_id: selectedFPO.fpo_id,
          state_code: selectedFPO.state_code,
          district_code: selectedFPO.district_code,
          commodity: entry.commodity,
          volume_tonnes: entry.volume_tonnes,
          turnover: entry.turnover,
          fy_year: fyYear,
          fy_month: month
        }, { headers })
      );

      await Promise.all(promises);

      toast.success('All entries submitted successfully');
      setEntries([{ commodity: '', volume_tonnes: 0, turnover: 0 }]);
      setSelectedFPO(null);
    } catch (error) {
      console.error('Error submitting data:', error);
      toast.error('Failed to submit data');
    } finally {
      setSubmitting(false);
    }
  };

  const generateFYYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
      years.push(`${i}-${i + 1}`);
    }
    return years;
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedFPO(null);
    setEntries([{ commodity: '', volume_tonnes: 0, turnover: 0 }]);
    setMonth('');
    setFyYear('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agribusiness Data Entry</h1>
          <p className="text-gray-600">Track commodity volumes and turnover for FPOs</p>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 via-white to-green-50 rounded-xl shadow-lg border border-blue-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-green-600 px-6 py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Select Period</h2>
              <p className="text-blue-50 text-sm">Choose month and financial year to begin</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>Month</span>
              </label>
              <div className="relative">
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer hover:border-blue-300 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={showModal}
                >
                  <option value="">Select Month</option>
                  {MONTHS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {month && (
                <div className="mt-2 flex items-center space-x-1 text-xs text-green-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Selected</span>
                </div>
              )}
            </div>

            <div className="relative">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span>Financial Year</span>
              </label>
              <div className="relative">
                <select
                  value={fyYear}
                  onChange={(e) => setFyYear(e.target.value)}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 appearance-none cursor-pointer hover:border-green-300 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={showModal}
                >
                  <option value="">Select FY</option>
                  {generateFYYears().map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {fyYear && (
                <div className="mt-2 flex items-center space-x-1 text-xs text-green-600">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="font-medium">Selected</span>
                </div>
              )}
            </div>
          </div>

          {month && fyYear && (
            <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-600 rounded-r-lg">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-blue-900">Period Selected</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    You've selected <span className="font-bold">{month} {fyYear}</span>. Click the button below to load FPC data.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <button
              onClick={handleSubmitPeriod}
              disabled={loading || showModal || !month || !fyYear}
              className="group relative px-8 py-3 bg-gradient-to-r from-blue-600 to-green-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 transform hover:scale-105 disabled:transform-none disabled:opacity-60"
            >
              <span className="flex items-center space-x-2">
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Loading...</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5" />
                    <span>Load FPC</span>
                  </>
                )}
              </span>
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Add Agribusiness Data</h2>
                <p className="text-sm text-gray-600 mt-1">Period: {month} {fyYear}</p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select FPO *
                </label>
                <select
                  value={selectedFPO?.fpo_id || ''}
                  onChange={(e) => {
                    const fpo = fpoList.find(f => f.fpo_id === parseInt(e.target.value));
                    if (fpo) handleFPOSelect(fpo);
                  }}
                  className="input"
                >
                  <option value="">Select FPO</option>
                  {fpoList.map(fpo => (
                    <option key={fpo.fpo_id} value={fpo.fpo_id}>{fpo.name}</option>
                  ))}
                </select>
              </div>

              {selectedFPO && (
                <>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-900">
                      {selectedFPO.name}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Commodity Entries</h3>
                      <button
                        onClick={addEntry}
                        className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Entry</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {entries.map((entry, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-gray-900">Entry {index + 1}</h4>
                            {entries.length > 1 && (
                              <button
                                onClick={() => removeEntry(index)}
                                className="text-red-600 hover:text-red-800 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Commodity *
                              </label>
                              <select
                                value={entry.commodity}
                                onChange={(e) => updateEntry(index, 'commodity', e.target.value)}
                                className="input"
                              >
                                <option value="">Select Commodity</option>
                                {COMMODITIES.map(commodity => (
                                  <option key={commodity} value={commodity}>{commodity}</option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Volume (Tonnes) *
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={entry.volume_tonnes}
                                onChange={(e) => updateEntry(index, 'volume_tonnes', parseFloat(e.target.value) || 0)}
                                className="input"
                                placeholder="Enter volume"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Turnover (₹) *
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={entry.turnover}
                                onChange={(e) => updateEntry(index, 'turnover', parseFloat(e.target.value) || 0)}
                                className="input"
                                placeholder="Enter turnover"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={handleCloseModal}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={handleSubmitData}
                      disabled={submitting}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{submitting ? 'Submitting...' : 'Submit Entries'}</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agribusiness;
