import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Trash2, Save, X } from 'lucide-react';

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

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Select Period</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Month
            </label>
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="input"
              disabled={showModal}
            >
              <option value="">Select Month</option>
              {MONTHS.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Financial Year
            </label>
            <select
              value={fyYear}
              onChange={(e) => setFyYear(e.target.value)}
              className="input"
              disabled={showModal}
            >
              <option value="">Select FY</option>
              {generateFYYears().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={handleSubmitPeriod}
          disabled={loading || showModal}
          className="btn-primary w-full md:w-auto"
        >
          {loading ? 'Loading...' : 'Load FPC'}
        </button>
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
