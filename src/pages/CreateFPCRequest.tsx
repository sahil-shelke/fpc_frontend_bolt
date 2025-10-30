import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Save, Building2 } from 'lucide-react';

interface CreateFPCRequestData {
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
  bod_name: string;
  bod_phone_number: string;
  bod_gender: 'm' | 'f';
  bod_date_of_joining: string;
  bod_qualification: string;
  address: string;
}

interface ProjectManager {
  phone_number: string;
  first_name: string;
  last_name: string;
  email: string;
  state_code: number | null;
  statename: string | null;
  district_code: number | null;
  districtname: string | null;
  role_id: number;
}

interface RegionalManager {
  phone_number: string;
  first_name: string;
  last_name: string;
  email: string;
  state_code: number | null;
  statename: string | null;
  district_code: number | null;
  districtname: string | null;
  role_id: number;
}

interface District {
  state_code: number;
  state_name: string;
  district_code: number;
  district_name: string;
}

const CreateFPCRequest: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [projectManagers, setProjectManagers] = useState<ProjectManager[]>([]);
  const [regionalManagers, setRegionalManagers] = useState<RegionalManager[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedStateCode, setSelectedStateCode] = useState<number | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateFPCRequestData>();

  useEffect(() => {
    fetchProjectManagers();
    fetchRegionalManagers();
    fetchDistricts();
  }, []);

  const fetchProjectManagers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/pm/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setProjectManagers(response.data);
    } catch (error: any) {
      console.error('Error fetching project managers:', error);
      toast.error('Failed to fetch project managers');
    }
  };

  const fetchRegionalManagers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/rm/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setRegionalManagers(response.data);
    } catch (error: any) {
      console.error('Error fetching regional managers:', error);
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

  const onSubmit = async (data: CreateFPCRequestData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Prepare the payload according to the API schema
      const payload = {
        name: data.name,
        state_code: data.state_code,
        district_code: data.district_code,
        fpc_registration_number: data.fpc_registration_number,
        pan: data.pan,
        tan: data.tan,
        gst_number: data.gst_number,
        registration_date: data.registration_date,
        registered_company_address: data.registered_company_address,
        office_address: data.office_address,
        office_block: data.office_block,
        office_contact_name: data.office_contact_name,
        office_contact_number: data.office_contact_number,
        office_contact_email: data.office_contact_email,
        responsible_wotr_staff_phone: data.responsible_wotr_staff_phone,
        project_manager_phone: data.project_manager_phone,
        is_approved: false, // New FPCs are not approved by default
        donors: [],
        bod_details: [{
          mobile_number: data.bod_phone_number,
          fpo_id: 0, // Will be set by backend
          name: data.bod_name,
          gender: data.bod_gender,
          education_qualification: data.bod_qualification || "",
          DIN: 10000000, // Default value, will be updated later
          address: data.address || "",
          date_of_joining: data.bod_date_of_joining || null
        }]
      };

      console.log('Sending payload:', payload);
      console.log('State code:', data.state_code, 'District code:', data.district_code);

      const response = await fetch('http://localhost:5000/fpo/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create FPC');
      }

      const result = await response.json();
      
      toast.success('FPC created successfully! Additional details can be added later through the dedicated forms.');
      reset();
      
    } catch (error: any) {
      console.error('Error creating FPC:', error);
      toast.error(error.message || 'Failed to create FPC');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Building2 className="h-8 w-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create New FPC</h1>
            <p className="text-gray-600">Create a new Farmer Producer Company with basic information</p>
          </div>
        </div>
      </div>

      {/* Information Card */}
      <div className="card p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 text-sm font-medium">ℹ</span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-900">What happens after creation?</h3>
            <p className="text-sm text-blue-700 mt-1">
              After creating the FPC with basic information, additional details like shareholders, CEO details, 
              licenses, and financial information can be added later through the dedicated management forms.
            </p>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic FPC Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Basic FPC Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="form-label">State *</label>
                <select
                  className="form-input"
                  {...register('state_code', { required: 'State is required', valueAsNumber: true })}
                  onChange={(e) => {
                    const code = parseInt(e.target.value);
                    setSelectedStateCode(code);
                    const selected = districts.find(d => d.state_code === code);
                    setSelectedState(selected?.state_name || '');
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
                  disabled={!selectedStateCode}
                >
                  <option value="">Select District</option>
                  {districts
                    .filter(d => d.state_code === selectedStateCode)
                    .map((district) => (
                      <option key={district.district_code} value={district.district_code}>
                        {district.district_name}
                      </option>
                    ))}
                </select>
                {errors.district_code && <p className="text-red-500 text-sm mt-1">{errors.district_code.message}</p>}
              </div>

              <div>
                <label className="form-label">FPC Name *</label>
                <input
                  {...register('name', { required: 'FPC name is required' })}
                  className="form-input"
                  placeholder="Enter FPC name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>
            </div>
          </div>

          {/* BOD Member Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">BOD Member Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="form-label">BOD Member Name *</label>
                <input
                  {...register('bod_name', { required: 'BOD member name is required' })}
                  className="form-input"
                  placeholder="Enter BOD member name"
                />
                {errors.bod_name && <p className="text-red-500 text-sm mt-1">{errors.bod_name.message}</p>}
              </div>

              <div>
                <label className="form-label">BOD Phone Number *</label>
                <input
                  {...register('bod_phone_number', { 
                    required: 'BOD phone number is required',
                    pattern: { value: /^[789]\d{9}$/, message: 'Invalid phone number' }
                  })}
                  className="form-input"
                  placeholder="Enter 10-digit phone number"
                  maxLength={10}
                />
                {errors.bod_phone_number && <p className="text-red-500 text-sm mt-1">{errors.bod_phone_number.message}</p>}
              </div>

              <div>
                <label className="form-label">BOD Gender *</label>
                <select
                  {...register('bod_gender', { required: 'BOD gender is required' })}
                  className="form-input"
                >
                  <option value="">Select Gender</option>
                  <option value="m">Male</option>
                  <option value="f">Female</option>
                </select>
                {errors.bod_gender && <p className="text-red-500 text-sm mt-1">{errors.bod_gender.message}</p>}
              </div>

              <div>
                <label className="form-label">BOD Date of Joining</label>
                <input
                  type="date"
                  {...register('bod_date_of_joining')}
                  className="form-input"
                />
              </div>

              <div>
                <label className="form-label">BOD Qualification</label>
                <select
                  {...register('bod_qualification')}
                  className="form-input"
                >
                  <option value="">Select Qualification</option>
                  <option value="illiterate">Illiterate</option>
                  <option value="secondary">Secondary</option>
                  <option value="higher secondary">Higher Secondary</option>
                  <option value="diploma">Diploma</option>
                  <option value="graduate">Graduate</option>
                  <option value="postgraduate">Postgraduate</option>
                  <option value="others">Others</option>
                </select>
              </div>

              <div>
                <label className="form-label">Address</label>
                <input
                  {...register('address')}
                  className="form-input"
                  placeholder="Enter address"
                />
              </div>
            </div>
          </div>

          {/* FPO Office Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">FPO Office Information</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <label className="form-label">WOTR Staff (Regional Manager) *</label>
                  <select
                    {...register('responsible_wotr_staff_phone', { required: 'WOTR staff is required' })}
                    className="form-input"
                  >
                    <option value="">Select Regional Manager</option>
                    {regionalManagers.map((rm) => (
                      <option key={rm.phone_number} value={rm.phone_number}>
                        {rm.first_name} {rm.last_name} | {rm.districtname || 'N/A'}, {rm.statename || 'N/A'} | {rm.phone_number}
                      </option>
                    ))}
                  </select>
                  {errors.responsible_wotr_staff_phone && <p className="text-red-500 text-sm mt-1">{errors.responsible_wotr_staff_phone.message}</p>}
                </div>

                <div>
                  <label className="form-label">Project Manager *</label>
                  <select
                    {...register('project_manager_phone', { required: 'Project manager is required' })}
                    className="form-input"
                  >
                    <option value="">Select Project Manager</option>
                    {projectManagers.map((pm) => (
                      <option key={pm.phone_number} value={pm.phone_number}>
                        {pm.first_name} {pm.last_name} | {pm.districtname || 'N/A'}, {pm.statename || 'N/A'} | {pm.phone_number}
                      </option>
                    ))}
                  </select>
                  {errors.project_manager_phone && <p className="text-red-500 text-sm mt-1">{errors.project_manager_phone.message}</p>}
                </div>
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
          </div>

          {/* Registration Documents */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Registration Documents</h3>
            
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

              <div className="md:col-span-2">
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
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => reset()}
            >
              Reset Form
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Creating FPC...' : 'Create FPC'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFPCRequest;