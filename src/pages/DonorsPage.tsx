import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Save, Heart, Trash2, Edit2, X, Plus, Building2 } from 'lucide-react';

const DONOR_TYPES = [
  "Government",
  "Private Foundation",
  "Corporate",
  "International Organization",
  "NGO",
  "Individual",
  "Others"
];

interface DonorItem {
  donor_type: string;
  donor_name: string;
}

interface DonorFormData {
  fpo_id: number;
  fpo_donor: DonorItem[];
}

interface Donor extends DonorFormData {
  id: number;
  fpo_name?: string;
}

const DonorsPage: React.FC = () => {
  const [fpo_id, setFpoId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [donors, setDonors] = useState<Donor[]>([]);
  const [fpos, setFpos] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [donorItems, setDonorItems] = useState<DonorItem[]>([{ donor_type: '', donor_name: '' }]);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<{ fpo_id: number }>();

  // ✅ Fetch all FPOs once on mount
  useEffect(() => {
    const fetchFPOs = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/fpo/approved', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setFpos(response.data);
        setFpoId(response.data[0]?.fpo_id || null);
      } catch (error) {
        toast.error('Failed to fetch FPOs');
      }
    };
    fetchFPOs();
  }, []);

  // ✅ Fetch donors when fpo_id changes
  useEffect(() => {
    if (fpo_id) fetchDonors();
  }, [fpo_id]);

  const fetchDonors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/donor/${fpo_id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const donorsData = Array.isArray(response.data) ? response.data : [];
      setDonors(donorsData);
    } catch (error: any) {
      console.error('Error fetching donors:', error);
      toast.error('Failed to fetch donors');
      setDonors([]);
    }
  };

  // const fetchFPOs = async () => {
  //   try {
  //     const token = localStorage.getItem('token');
  //     const response = await axios.get('http://localhost:5000/fpo/approved', {
  //       headers: {
  //         'Authorization': `Bearer ${token}`
  //       }
  //     });
  //     setFpos(response.data);
  //   } catch (error: any) {
  //     console.error('Error fetching FPOs:', error);
  //     toast.error('Failed to fetch FPOs');
  //   }
  // };


  const onSubmit = async (data: { fpo_id: number }) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');

      const validDonors = donorItems.filter(item => item.donor_type && item.donor_name);

      if (validDonors.length === 0) {
        toast.error('Please add at least one donor');
        setLoading(false);
        return;
      }

      const payload: DonorFormData = {
        fpo_id: Number(data.fpo_id),
        fpo_donor: validDonors
      };

      if (editingId) {
        await axios.put(`http://localhost:5000/donor/${editingId}`, payload, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        toast.success('Donors updated successfully!');
        setEditingId(null);
      } else {
        await axios.post('http://localhost:5000/donor/', payload, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        toast.success('Donors added successfully!');
      }

      reset();
      setDonorItems([{ donor_type: '', donor_name: '' }]);
      setShowModal(false);
      fetchDonors();
    } catch (error: any) {
      console.error('Error saving donors:', error);
      toast.error(error.response?.data?.detail || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (donor: Donor) => {
    setEditingId(donor.id);
    setValue('fpo_id', donor.fpo_id);
    const donorData = Array.isArray(donor.fpo_donor) && donor.fpo_donor.length > 0
      ? donor.fpo_donor
      : [{ donor_type: '', donor_name: '' }];
    setDonorItems(donorData);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setDonorItems([{ donor_type: '', donor_name: '' }]);
    reset();
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this donor record?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/donor/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        toast.success('Donor deleted successfully!');
        fetchDonors();
      } catch (error: any) {
        console.error('Error deleting donor:', error);
        toast.error('Failed to delete donor');
      }
    }
  };

  const addDonorItem = () => {
    setDonorItems([...donorItems, { donor_type: '', donor_name: '' }]);
  };

  const removeDonorItem = (index: number) => {
    if (donorItems.length > 1) {
      setDonorItems(donorItems.filter((_, i) => i !== index));
    }
  };

  const updateDonorItem = (index: number, field: keyof DonorItem, value: string) => {
    const updated = [...donorItems];
    updated[index][field] = value;
    setDonorItems(updated);
  };

  const getTotalDonors = () => {
    return donors.reduce((total, donor) => {
      const donorCount = Array.isArray(donor.fpo_donor) ? donor.fpo_donor.length : 0;
      return total + donorCount;
    }, 0);
  };

  const getDonorsByType = (type: string) => {
    return donors.reduce((count, donor) => {
      if (Array.isArray(donor.fpo_donor)) {
        const typeCount = donor.fpo_donor.filter(d => d.donor_type === type).length;
        return count + typeCount;
      }
      return count;
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">FPC Donors</h1>
          <p className="text-gray-600">Manage donor information and funding sources</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Donor</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-primary-100">
              <Heart className="h-6 w-6 text-primary-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Donors</p>
              <p className="text-2xl font-bold text-gray-900">{getTotalDonors()}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <Building2 className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">FPCs with Donors</p>
              <p className="text-2xl font-bold text-gray-900">{donors.length}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <Heart className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Government Donors</p>
              <p className="text-2xl font-bold text-gray-900">{getDonorsByType('Government')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Donors List */}
      <div className="card">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Donor Records</h2>
        </div>

        {donors.length === 0 ? (
          <div className="p-12 text-center">
            <Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No donors recorded</h3>
            <p className="text-gray-600 mb-4">Start by adding your first donor record.</p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Donor</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    FPC Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Donor Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Donor Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {donors.map((donor) => {
                  const fpoName = fpos.find(f => f.fpo_id === donor.fpo_id)?.name || 'N/A';
                  const donorList = Array.isArray(donor.fpo_donor) && donor.fpo_donor.length > 0
                    ? donor.fpo_donor
                    : [{ donor_name: 'No donors', donor_type: '-' }];

                  return donorList.map((d, idx) => (
                    <tr key={`${donor.id}-${idx}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {fpoName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{d.donor_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-700">
                          {d.donor_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {idx === 0 && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(donor)}
                              className="text-primary-600 hover:text-primary-900"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(donor.id)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ));
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Donor Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-primary-600" />
                  <h2 className="text-xl font-bold text-gray-900">
                    {editingId ? 'Edit Donors' : 'Add New Donors'}
                  </h2>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
              {/* FPO Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  FPC Name <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('fpo_id', { required: 'FPC is required' })}
                  className="form-input"
                >
                  <option value="">Select FPC</option>
                  {fpos.map(fpo => (
                    <option key={fpo.fpo_id} value={fpo.fpo_id}>
                      {fpo.fpo_name}
                    </option>
                  ))}
                </select>
                {errors.fpo_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.fpo_id.message}</p>
                )}
              </div>

              {/* Donor Items */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-700 flex items-center">
                    <Heart className="h-4 w-4 mr-2" />
                    Donor Information
                  </h3>
                  <button
                    type="button"
                    onClick={addDonorItem}
                    className="btn-secondary text-sm flex items-center space-x-1"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add Donor</span>
                  </button>
                </div>

                {donorItems.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Donor {index + 1}</span>
                      {donorItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeDonorItem(index)}
                          className="text-red-600 hover:text-red-900"
                          title="Remove"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Donor Type <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={item.donor_type}
                          onChange={(e) => updateDonorItem(index, 'donor_type', e.target.value)}
                          className="form-input"
                          required
                        >
                          <option value="">Select Donor Type</option>
                          {DONOR_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm text-gray-600 mb-2">
                          Donor Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={item.donor_name}
                          onChange={(e) => updateDonorItem(index, 'donor_name', e.target.value)}
                          className="form-input"
                          placeholder="Enter donor name"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCloseModal}
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
                  <span>{loading ? 'Saving...' : editingId ? 'Update Donors' : 'Save Donors'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorsPage;

