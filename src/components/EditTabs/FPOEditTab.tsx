import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Save, Building2 } from 'lucide-react';

interface FPOData {
  name: string;
  state_code: number | null;
  district_code: number | null;
  fpc_registration_number: string;
  pan: string;
  tan: string;
  gst_number: string;
  registration_date: string;
  registered_company_address: string;
  office_address: string;
  office_block: string;
  office_contact_name: string;
  office_contact_number: string;
  office_contact_email: string;
  responsible_wotr_staff_phone: string;
  project_manager_phone: string;
}

interface District {
  state_code: number;
  state_name: string;
  district_code: number;
  district_name: string;
}

interface FPOEditTabProps {
  fpoId: number;
}

const FPOEditTab: React.FC<FPOEditTabProps> = ({ fpoId }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedState, setSelectedState] = useState('');
  const [originalData, setOriginalData] = useState<FPOData | null>(null);

  const { register, handleSubmit, reset, watch, formState: { errors, dirtyFields } } = useForm<FPOData>();

  const stateCode = watch('state_code');

  useEffect(() => {
    fetchFPOData();
    fetchDistricts();
  }, [fpoId]);

  useEffect(() => {
    if (stateCode && districts.length > 0) {
      const state = districts.find(d => d.state_code === Number(stateCode));
      setSelectedState(state?.state_name || '');
    }
  }, [stateCode, districts]);

  const fetchFPOData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:5000/fpo/${fpoId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = response.data;
      setOriginalData(data);
      reset(data);

      const state = districts.find(d => d.state_code === data.state_code);
      if (state) {
        setSelectedState(state.state_name);
      }
    } catch (error) {
      console.error('Error fetching FPO data:', error);
      toast.error('Failed to load FPO data');
    } finally {
      setLoading(false);
    }
  };

  const fetchDistricts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/districts/districts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setDistricts(response.data);
    } catch (error) {
      console.error('Error fetching districts:', error);
      toast.error('Failed to fetch districts');
    }
  };

  const onSubmit = async (data: FPOData) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');

      const changedData: Partial<FPOData> = {};

      (Object.keys(dirtyFields) as Array<keyof FPOData>).forEach((key) => {
        if (dirtyFields[key]) {
          changedData[key] = data[key] as any;
        }
      });

      if (Object.keys(changedData).length === 0) {
        toast('No changes to save', { icon: 'ℹ️' });
        return;
      }

      await axios.put(`http://localhost:5000/fpo/${fpoId}`, changedData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      toast.success('FPO details updated successfully!');
      setOriginalData(data);
      fetchFPOData();
    } catch (error: any) {
      console.error('Error updating FPO:', error);
      toast.error(error.response?.data?.detail || 'Failed to update FPO details');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="flex items-center space-x-3 pb-4 border-b">
        <Building2 className="h-6 w-6 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-900">Basic FPO Information</h3>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="form-label">FPC Name *</label>
            <input
              {...register('name', { required: 'FPC name is required' })}
              className="form-input"
              placeholder="Enter FPC name"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="form-label">State *</label>
            <select
              {...register('state_code', { required: 'State is required', valueAsNumber: true })}
              className="form-input"
              onChange={(e) => {
                const code = Number(e.target.value);
                const state = districts.find(d => d.state_code === code);
                setSelectedState(state?.state_name || '');
              }}
            >
              <option value="">Select State</option>
              {[...new Map(districts.map(d => [d.state_code, d.state_name]))]
                .map(([code, name]) => (
                  <option key={code} value={code}>
                    {name}
                  </option>
                ))}
            </select>
            {errors.state_code && <p className="text-red-500 text-sm mt-1">{errors.state_code.message}</p>}
          </div>

          <div>
            <label className="form-label">District *</label>
            <select
              {...register('district_code', { required: 'District is required', valueAsNumber: true })}
              className="form-input"
              disabled={!selectedState}
            >
              <option value="">Select District</option>
              {districts
                .filter(d => d.state_name === selectedState)
                .map((district) => (
                  <option key={district.district_code} value={district.district_code}>
                    {district.district_name}
                  </option>
                ))}
            </select>
            {errors.district_code && <p className="text-red-500 text-sm mt-1">{errors.district_code.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="form-label">FPC Registration Number *</label>
            <input
              {...register('fpc_registration_number', { required: 'Registration number is required' })}
              className="form-input"
              placeholder="Enter FPC registration number"
            />
            {errors.fpc_registration_number && <p className="text-red-500 text-sm mt-1">{errors.fpc_registration_number.message}</p>}
          </div>

          <div>
            <label className="form-label">Registration Date *</label>
            <input
              type="date"
              {...register('registration_date', { required: 'Registration date is required' })}
              className="form-input"
            />
            {errors.registration_date && <p className="text-red-500 text-sm mt-1">{errors.registration_date.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="form-label">PAN Number *</label>
            <input
              {...register('pan', {
                required: 'PAN is required',
                pattern: { value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'Invalid PAN format' }
              })}
              className="form-input"
              placeholder="Enter PAN number"
              maxLength={10}
            />
            {errors.pan && <p className="text-red-500 text-sm mt-1">{errors.pan.message}</p>}
          </div>

          <div>
            <label className="form-label">TAN Number *</label>
            <input
              {...register('tan', {
                required: 'TAN is required',
                maxLength: { value: 10, message: 'TAN must be 10 characters' }
              })}
              className="form-input"
              placeholder="Enter TAN number"
              maxLength={10}
            />
            {errors.tan && <p className="text-red-500 text-sm mt-1">{errors.tan.message}</p>}
          </div>

          <div>
            <label className="form-label">GST Number *</label>
            <input
              {...register('gst_number', {
                required: 'GST number is required',
                pattern: { value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, message: 'Invalid GST format' }
              })}
              className="form-input"
              placeholder="Enter GST number"
              maxLength={15}
            />
            {errors.gst_number && <p className="text-red-500 text-sm mt-1">{errors.gst_number.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="form-label">Registered Company Address *</label>
            <textarea
              {...register('registered_company_address', { required: 'Address is required' })}
              className="form-input"
              rows={3}
              placeholder="Enter registered company address"
            />
            {errors.registered_company_address && <p className="text-red-500 text-sm mt-1">{errors.registered_company_address.message}</p>}
          </div>

          <div>
            <label className="form-label">Office Address *</label>
            <textarea
              {...register('office_address', { required: 'Office address is required' })}
              className="form-input"
              rows={3}
              placeholder="Enter office address"
            />
            {errors.office_address && <p className="text-red-500 text-sm mt-1">{errors.office_address.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="form-label">Office Block *</label>
            <input
              {...register('office_block', { required: 'Office block is required' })}
              className="form-input"
              placeholder="Enter office block"
            />
            {errors.office_block && <p className="text-red-500 text-sm mt-1">{errors.office_block.message}</p>}
          </div>

          <div>
            <label className="form-label">Contact Person *</label>
            <input
              {...register('office_contact_name', { required: 'Contact person is required' })}
              className="form-input"
              placeholder="Enter contact person name"
            />
            {errors.office_contact_name && <p className="text-red-500 text-sm mt-1">{errors.office_contact_name.message}</p>}
          </div>

          <div>
            <label className="form-label">Contact Phone *</label>
            <input
              {...register('office_contact_number', {
                required: 'Contact phone is required',
                pattern: { value: /^[789]\d{9}$/, message: 'Invalid phone number' }
              })}
              className="form-input"
              placeholder="Enter 10-digit phone number"
              maxLength={10}
            />
            {errors.office_contact_number && <p className="text-red-500 text-sm mt-1">{errors.office_contact_number.message}</p>}
          </div>

          <div>
            <label className="form-label">Contact Email *</label>
            <input
              type="email"
              {...register('office_contact_email', { required: 'Contact email is required' })}
              className="form-input"
              placeholder="Enter email address"
            />
            {errors.office_contact_email && <p className="text-red-500 text-sm mt-1">{errors.office_contact_email.message}</p>}
          </div>

          <div>
            <label className="form-label">WOTR Staff Phone *</label>
            <input
              {...register('responsible_wotr_staff_phone', {
                required: 'WOTR staff phone is required',
                pattern: { value: /^[789]\d{9}$/, message: 'Invalid phone number' }
              })}
              className="form-input"
              placeholder="Enter 10-digit phone number"
              maxLength={10}
            />
            {errors.responsible_wotr_staff_phone && <p className="text-red-500 text-sm mt-1">{errors.responsible_wotr_staff_phone.message}</p>}
          </div>

          <div>
            <label className="form-label">Project Manager Phone *</label>
            <input
              {...register('project_manager_phone', {
                required: 'Project manager phone is required',
                pattern: { value: /^[789]\d{9}$/, message: 'Invalid phone number' }
              })}
              className="form-input"
              placeholder="Enter 10-digit phone number"
              maxLength={10}
            />
            {errors.project_manager_phone && <p className="text-red-500 text-sm mt-1">{errors.project_manager_phone.message}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-6 border-t">
        <button
          type="submit"
          disabled={saving}
          className="btn-primary flex items-center space-x-2"
        >
          <Save className="h-4 w-4" />
          <span>{saving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>
    </form>
  );
};

export default FPOEditTab;
