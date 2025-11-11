import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FileText, Edit, Save, X, Plus } from 'lucide-react';

interface LicenseFormData {
  fpo_id: number;
  category: 'seed' | 'fertilizer' | 'pesticide' | 'food' | 'apmc_mandi' | 'direct_marketing' | 'organic' | 'udyam' | 'drone' | 'pollution' | 'shop_act' | 'brand' | 'other';
  other_category_name?: string;
  license_number: string;
  license_date?: string;
  license_expiry?: string;
}

interface License extends LicenseFormData {
  id: number;
}

interface LicenseEditTabProps {
  fpoId: number;
}

const LICENSE_CATEGORIES = [
  { value: 'seed', label: 'Seed' },
  { value: 'fertilizer', label: 'Fertilizer' },
  { value: 'pesticide', label: 'Pesticide' },
  { value: 'food', label: 'Food' },
  { value: 'apmc_mandi', label: 'APMC Mandi' },
  { value: 'direct_marketing', label: 'Direct Marketing' },
  { value: 'organic', label: 'Organic' },
  { value: 'udyam', label: 'Udyam' },
  { value: 'drone', label: 'Drone' },
  { value: 'pollution', label: 'Pollution' },
  { value: 'shop_act', label: 'Shop Act' },
  { value: 'brand', label: 'Brand' },
  { value: 'other', label: 'Other' }
];

const LicenseEditTab: React.FC<LicenseEditTabProps> = ({ fpoId }) => {
  const [licenses, setLicenses] = useState<License[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [originalData, setOriginalData] = useState<License | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors, dirtyFields } } = useForm<LicenseFormData>({
    defaultValues: {
      fpo_id: fpoId,
      category: 'seed'
    }
  });

  const selectedCategory = watch('category');

  useEffect(() => {
    fetchLicenses();
  }, [fpoId]);

  const fetchLicenses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/licenses/${fpoId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setLicenses(response.data || []);
    } catch (error: any) {
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch licenses');
      }
      setLicenses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (license: License) => {
    setEditingId(license.id);
    setOriginalData(license);
    reset({
      ...license,
      license_date: license.license_date?.split('T')[0] || '',
      license_expiry: license.license_expiry?.split('T')[0] || '',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setOriginalData(null);
    setShowAddForm(false);
    reset({
      fpo_id: fpoId,
      category: 'seed',
      license_number: '',
      license_date: '',
      license_expiry: ''
    });
  };

  const handleAddNew = () => {
    setEditingId(null);
    setOriginalData(null);
    setShowAddForm(true);
    reset({
      fpo_id: fpoId,
      category: 'seed',
      license_number: '',
      license_date: '',
      license_expiry: ''
    });
  };

  const onSubmit = async (data: LicenseFormData) => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      data.fpo_id = fpoId;

      if (showAddForm) {
        await axios.post(
          '/api/licenses/',
          data,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        toast.success('License created successfully!');
      } else if (editingId) {
        const changedFields: Partial<LicenseFormData> = {};

        (Object.keys(dirtyFields) as Array<keyof LicenseFormData>).forEach((key) => {
          if (dirtyFields[key]) {
            changedFields[key] = data[key] as any;
          }
        });

        if (Object.keys(changedFields).length === 0) {
          toast('No changes to save');
          handleCancelEdit();
          return;
        }

        changedFields.fpo_id = fpoId;

        await axios.put(
          `/api/licenses/${editingId}`,
          changedFields,
          {
            headers: { 'Authorization': `Bearer ${token}` }
          }
        );
        toast.success('License updated successfully!');
      }

      handleCancelEdit();
      fetchLicenses();
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
        <p className="ml-3 text-gray-600">Loading licenses...</p>
      </div>
    );
  }

  const renderForm = () => (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category <span className="text-red-500">*</span>
          </label>
          <select {...register('category', { required: true })} className="form-input w-full">
            {LICENSE_CATEGORIES.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        {selectedCategory === 'other' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Other Category Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register('other_category_name', {
                required: selectedCategory === 'other' ? 'Category name is required' : false
              })}
              className="form-input w-full"
            />
            {errors.other_category_name && (
              <p className="text-xs text-red-600 mt-1">{errors.other_category_name.message}</p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            License Number <span className="text-red-500">*</span>
          </label>
          <input
            {...register('license_number', { required: 'License number is required' })}
            className="form-input w-full"
          />
          {errors.license_number && (
            <p className="text-xs text-red-600 mt-1">{errors.license_number.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">License Date</label>
          <input type="date" {...register('license_date')} className="form-input w-full" />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">License Expiry</label>
          <input type="date" {...register('license_expiry')} className="form-input w-full" />
        </div>
      </div>

      <div className="flex space-x-2 pt-4 border-t">
        <button type="submit" disabled={isSubmitting} className="btn-primary flex items-center disabled:opacity-50">
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? (showAddForm ? 'Creating...' : 'Saving...') : (showAddForm ? 'Create License' : 'Save Changes')}
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
          <FileText className="h-5 w-5 mr-2" />
          Licenses
        </h3>
        <div className="flex items-center space-x-3">
          <span className="text-sm text-gray-500">{licenses.length} licenses</span>
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
          <h4 className="font-semibold text-gray-900 mb-4">Add New License</h4>
          {renderForm()}
        </div>
      )}

      {licenses.length === 0 && !showAddForm ? (
        <div className="text-center py-8 text-gray-500">
          <FileText className="h-12 w-12 mx-auto text-gray-300 mb-2" />
          <p>No licenses found for this FPC</p>
        </div>
      ) : (
        <div className="space-y-4">
          {licenses.map((license) => (
            <div key={license.id} className="border border-gray-200 rounded-lg p-4">
              {editingId === license.id ? (
                renderForm()
              ) : (
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">
                        {LICENSE_CATEGORIES.find(c => c.value === license.category)?.label || license.category}
                        {license.category === 'other' && license.other_category_name && ` - ${license.other_category_name}`}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">License #: {license.license_number}</p>
                    </div>
                    <button
                      onClick={() => handleEdit(license)}
                      className="text-primary-600 hover:text-primary-900 flex items-center"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {license.license_date && (
                      <div>
                        <p className="text-gray-500">License Date</p>
                        <p className="font-medium text-gray-900">
                          {new Date(license.license_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    {license.license_expiry && (
                      <div>
                        <p className="text-gray-500">License Expiry</p>
                        <p className="font-medium text-gray-900">
                          {new Date(license.license_expiry).toLocaleDateString()}
                        </p>
                      </div>
                    )}
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

export default LicenseEditTab;
