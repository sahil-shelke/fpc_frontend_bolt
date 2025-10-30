import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Trash2, Save } from 'lucide-react';

interface FPO {
  id: number;
  fpo_name: string;
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
  const [showFPODropdown, setShowFPODropdown] = useState(false);
  const [fpoList, setFpoList] = useState<FPO[]>([]);
  const [selectedFPO, setSelectedFPO] = useState<FPO | null>(null);
  const [entries, setEntries] = useState<CommodityEntry[]>([
    { commodity: '', volume_tonnes: 0, turnover: 0 }
  ]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
      setShowFPODropdown(true);
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
    toast.success(`Selected: ${fpo.fpo_name}`);
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
        axios.post('http://localhost:5000/agribusiness', {
          fpo_id: selectedFPO.id,
          commodity: entry.commodity,
          volume_tonnes: entry.volume_tonnes,
          turnover: entry.turnover,
          fy_year: fyYear,
          month: month
        }, { headers })
      );

      await Promise.all(promises);

      toast.success('All entries submitted successfully');
      setEntries([{ commodity: '', volume_tonnes: 0, turnover: 0 }]);
      setSelectedFPO(null);
      setShowFPODropdown(false);
      setMonth('');
      setFyYear('');
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
              disabled={showFPODropdown}
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
              disabled={showFPODropdown}
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
          disabled={loading || showFPODropdown}
          className="btn-primary w-full md:w-auto"
        >
          {loading ? 'Loading...' : 'Load FPO List'}
        </button>
      </div>

      {showFPODropdown && (
        <div className="card p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select FPO</h2>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              FPO Name
            </label>
            <select
              value={selectedFPO?.id || ''}
              onChange={(e) => {
                const fpo = fpoList.find(f => f.id === parseInt(e.target.value));
                if (fpo) handleFPOSelect(fpo);
              }}
              className="input"
            >
              <option value="">Select FPO</option>
              {fpoList.map(fpo => (
                <option key={fpo.id} value={fpo.id}>{fpo.fpo_name}</option>
              ))}
            </select>
          </div>

          {selectedFPO && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Selected FPO:</strong> {selectedFPO.fpo_name}
              </p>
              <p className="text-sm text-blue-700">
                Period: {month} {fyYear}
              </p>
            </div>
          )}
        </div>
      )}

      {selectedFPO && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Commodity Entries</h2>
            <button
              onClick={addEntry}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Entry</span>
            </button>
          </div>

          <div className="space-y-4">
            {entries.map((entry, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">Entry {index + 1}</h3>
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
                      Commodity
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
                      Volume (Tonnes)
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
                      Turnover (₹)
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

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSubmitData}
              disabled={submitting}
              className="btn-primary flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Submitting...' : 'Submit All Entries'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Agribusiness;
