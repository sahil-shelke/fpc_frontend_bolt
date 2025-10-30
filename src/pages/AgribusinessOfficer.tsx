import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Save, Users, Edit, Trash2, Plus, Filter } from 'lucide-react';
import ProjectManagers from './ProjectManagers';

interface AgribusinessOfficerData {
  phone_number: string;
  first_name: string;
  last_name: string;
  password: string;
  email: string;
  state_code: number | null;
  district_code: number | null;
  role_id: number;
}

interface District {
  state_code: number;
  state_name: string;
  district_code: number;
  district_name: string;
}

const AgribusinessOfficers: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [officers, setOfficers] = useState<any[]>([]);
  const [editingPhone, setEditingPhone] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [filterState, setFilterState] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('');
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedStateCode, setSelectedStateCode] = useState<number | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AgribusinessOfficerData>({
    defaultValues: {
      role_id: 5 // Agribusiness Officer role
    }
  });

  useEffect(() => {
    fetchOfficers();
    fetchDistricts();
  }, []);

  const fetchOfficers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/pm/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setOfficers(response.data);
    } catch (error) {
      toast.error('Failed to fetch agribusiness officers');
    }
  };

  const fetchDistricts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/districts/districts', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setDistricts(response.data);
    } catch (error: any) {
      console.error('Error fetching districts:', error);
      toast.error('Failed to fetch districts');
    }
  };

  const onSubmit = async (data: AgribusinessOfficerData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

    const finalData: AgribusinessOfficerData = {
      ...data,
      state_code: selectedStateCode,                   // state_code from dropdown
     // district_code from input
    };

      if (editingPhone) {
        await axios.put(`http://localhost:5000/pm/${editingPhone}`, finalData, { headers });
        toast.success('Project Manager updated successfully!');
        setEditingPhone(null);
      } else {
        await axios.post('http://localhost:5000/pm/', finalData, { headers });
        toast.success('Project Manager created successfully!');
      }

      reset();
      setShowForm(false);
      fetchOfficers();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };






  const handleEdit = (officer: any) => {
    setEditingPhone(officer.phone_number);
    reset({
      ...officer,
      password: '' // Don't pre-fill password for security
    });
    setShowForm(true);
  };

  const handleDelete = async (phone_number: string) => {
    if (window.confirm('Are you sure you want to delete this Agribusiness Officer?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/pm/${phone_number}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        toast.success('Agribusiness Officer deleted successfully!');
        fetchOfficers();
      } catch (error) {
        toast.error('Failed to delete Agribusiness Officer');
      }
    }
  };



  const filteredOfficers = officers.filter(officer => {
    const matchesState = filterState === '' || officer.statename === filterState;
    const matchesDistrict = filterDistrict === '' || officer.districtname?.toLowerCase().includes(filterDistrict.toLowerCase());
    return matchesState && matchesDistrict;
  });


  const uniqueStates = [...new Set(officers.map(officer => officer.statename))].filter(Boolean).sort();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-primary-600" />
          <h1 className="text-2xl font-bold text-gray-900">Project Managers</h1>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingPhone(null);
            reset({ role_id: 3 });
          }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Agribusiness Officer</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4">
        <div className="flex items-center space-x-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <div className="flex items-center space-x-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mr-2">State:</label>
              <select
                value={filterState}
                onChange={(e) => setFilterState(e.target.value)}
                className="form-input w-48"
              >
                <option value="">All States</option>
                {uniqueStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mr-2">District:</label>
              <input
                type="text"
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
                placeholder="Search district..."
                className="form-input w-48"
              />
            </div>
            <div className="text-sm text-gray-500">
              Showing {filteredOfficers.length} of {officers.length} officers
            </div>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                {editingPhone ? 'Edit Agribusiness Officer' : 'Add Agribusiness Officer'}
              </h2>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="form-label">Phone Number *</label>
                  <input
                    {...register('phone_number', { 
                      required: 'Phone number is required',
                      pattern: { value: /^[789]\d{9}$/, message: 'Invalid phone number' }
                    })}
                    className="form-input"
                    placeholder="Enter 10-digit phone number"
                    maxLength={10}
                    disabled={!!editingPhone}
                  />
                  {errors.phone_number && <p className="text-red-500 text-sm mt-1">{errors.phone_number.message}</p>}
                  {editingPhone && <p className="text-sm text-gray-500 mt-1">Phone number cannot be changed</p>}
                </div>

                <div>
                  <label className="form-label">Email *</label>
                  <input
                    type="email"
                    {...register('email', { required: 'Email is required' })}
                    className="form-input"
                    placeholder="Enter email address"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="form-label">First Name *</label>
                  <input
                    {...register('first_name', { required: 'First name is required' })}
                    className="form-input"
                    placeholder="Enter first name"
                  />
                  {errors.first_name && <p className="text-red-500 text-sm mt-1">{errors.first_name.message}</p>}
                </div>

                <div>
                  <label className="form-label">Last Name *</label>
                  <input
                    {...register('last_name', { required: 'Last name is required' })}
                    className="form-input"
                    placeholder="Enter last name"
                  />
                  {errors.last_name && <p className="text-red-500 text-sm mt-1">{errors.last_name.message}</p>}
                </div>

                <div>
                  <label className="form-label">Password *</label>
                  <input
                    type="password"
                    {...register('password', { minLength: { value: 6, message: 'Password must be at least 6 characters' } })}
                    className="form-input"
                    placeholder={editingPhone ? "Leave blank to keep current password" : "Enter password"}
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
                  {editingPhone && <p className="text-sm text-gray-500 mt-1">Leave blank to keep current password</p>}
                </div>

                <div>
                  <label className="form-label">State *</label>
                  <select
                    {...register('state_code', { required: 'State is required' })}
                    className="form-input"
                    onChange={(e) => {
                      const stateName = e.target.value;
                      setSelectedState(stateName);
                      const stateData = districts.find(d => d.state_name === stateName);
                      setSelectedStateCode(stateData?.state_code || null);
                    }}
                  >
                    <option value="">Select State</option>
                    {[...new Set(districts.map(d => d.state_name))].sort().map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                  {errors.state_code && <p className="text-red-500 text-sm mt-1">{errors.state_code.message}</p>}
                </div>

                <div>
                  <label className="form-label">District *</label>
                  <select
                    {...register('district_code', { required: 'District is required' })}
                    className="form-input"
                    disabled={!selectedState}
                  >
                    <option value="">Select District</option>
                    {districts
                      .filter(d => d.state_name === selectedState)
                      .map((district) => (
                        <option key={district.district_code} value={district.district_code.toString()}>
                          {district.district_name}
                        </option>
                      ))}
                  </select>
                  {errors.district_code && <p className="text-red-500 text-sm mt-1">{errors.district_code.message}</p>}
                </div>

                <input type="hidden" {...register('role_id')} value={3} />
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPhone(null);
                    reset();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{loading ? 'Saving...' : editingPhone ? 'Update Manager' : 'Create Manager'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Managers List */}
      <div className="card p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">District</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOfficers.map((officer) => (
                <tr key={officer.phone_number}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {officer.first_name} {officer.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{officer.phone_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{officer.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{officer.statename}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{officer.districtname}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(officer)}
                      className="text-primary-600 hover:text-primary-900 flex items-center space-x-1"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(officer.phone_number)}
                      className="text-red-600 hover:text-red-900 flex items-center space-x-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredOfficers.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Agribusiness Officers found</h3>
              <p className="text-gray-600">
                {officers.length === 0 ? 'Get started by adding your first Agribusiness Officer.' : 'Try adjusting your filters.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgribusinessOfficers;