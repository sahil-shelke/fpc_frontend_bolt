import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Heart, Edit, Save, X, Plus, Trash2 } from 'lucide-react';

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

interface DonorEditTabProps {
  fpoId: number;
}

const DonorEditTab: React.FC<DonorEditTabProps> = ({ fpoId }) => {
  const [donors, setDonors] = useState<Donor[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [originalData, setOriginalData] = useState<Donor | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, control, formState: { errors, dirtyFields } } = useForm<DonorFormData>({
    defaultValues: {
      fpo_id: fpoId,
      fpo_donor: [{ donor_type: 'Government', donor_name: '' }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'fpo_donor'
  });

  useEffect(() => {
    fetchDonors();
  }, [fpoId]);

  const fetchDonors = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/donors/${fpoId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setDonors(response.data || []);
    } catch (error: any) {
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch donors');
      }
      setDonors([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (donor: Donor) => {
    setEditingId(donor.id);
    setOriginalData(donor);
    reset(donor);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setOriginalData(null);
    setShowAddForm(false);
    reset({
      fpo_id: fpoId,
      fpo_donor: [{ donor_type: 'Government', donor_name: '' }]
    });
  };

  const handleAddNew = () => {
    setEditingId(null);
    setOriginalData(null);
    setShowAddForm(true);
    reset({
      fpo_id: fpoId,
      fpo_donor: [{ donor_type: 'Government', donor_name: '' }]
    });
  };

  const onSubmit = async (data: DonorFormData) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      data.fpo_id = fpoId;

      if (showAddForm) {
        await axios.post(
          'http://localhost:5000/donors/',
          data,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        toast.success('Donor record created successfully!');
      } else if (editingId) {
        await axios.put(
          `http://localhost:5000/donors/${editingId}`,
          data,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        toast.success('Donor record updated successfully!');
      }

      handleCancelEdit();
      fetchDonors();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <p className="ml-3 text-gray-600">Loading donors...</p>
      </div>
    );
  }

  const renderForm = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Donors <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={() => append({ donor_type: 'Government', donor_name: '' })}
            className="text-sm text-primary-600 hover:text-primary-900 flex items-center"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Donor
          </button>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-3 items-start">
            <div className="flex-1">
              <select
                {...register(`fpo_donor.${index}.donor_type` as const, { required: true })}
                className="form-input w-full"
              >
                {DONOR_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <input
                {...register(`fpo_donor.${index}.donor_name` as const, { required: 'Donor name is required' })}
                className="form-input w-full"
                placeholder="Donor name"
              />
              {errors.fpo_donor?.[index]?.donor_name && (
                <p className="text-xs text-red-600 mt-1">{errors.fpo_donor[index]?.donor_name?.message}</p>
              )}
            </div>
            {fields.length > 1 && (
              <button
                type="button"
                onClick={() => remove(index)}
                className="px-2 py-2 text-red-600 hover:text-red-900"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="flex space-x-2 pt-4 border-t">
        <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center disabled:opacity-50">
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? (showAddForm ? 'Creating...' : 'Saving...') : (showAddForm ? 'Create Record' : 'Save Changes')}
        </button>
        <button
          type="button"
          onClick={handleCancelEdit}
          disabled={isSubmitting}
          className="btn-secondary flex items-center"
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </button>
      </div>
    </form>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Heart className="h-5 w-5 mr-2" />
          Donors
        </h3>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">{donors.length} records</span>
          <button
            onClick={handleAddNew}
            disabled={showAddForm || editingId !== null}
            className="btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="border border-green-200 bg-green-50 rounded-lg p-4 mb-4">
          <h4 className="font-semibold text-gray-900 mb-4">Add New Donor Record</h4>
          {renderForm()}
        </div>
      )}

      {donors.length === 0 && !showAddForm ? (
        <div className="text-center py-8 text-gray-500">
          <Heart className="h-12 w-12 mx-auto text-gray-300 mb-2" />
          <p>No donor records found for this FPC</p>
        </div>
      ) : (
        <div className="space-y-4">
          {donors.map((donor) => (
            <div key={donor.id} className="border border-gray-200 rounded-lg p-4">
              {editingId === donor.id ? (
                renderForm()
              ) : (
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 text-lg">Donor Information</h4>
                    <button
                      onClick={() => handleEdit(donor)}
                      className="text-primary-600 hover:text-primary-900 flex items-center"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                  </div>

                  <div className="space-y-2">
                    {donor.fpo_donor.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <span className="inline-flex px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {item.donor_type}
                        </span>
                        <span className="font-medium text-gray-900">{item.donor_name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DonorEditTab;
