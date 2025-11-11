import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Building2, MapPin, Calendar, Users, Phone, Mail, Eye, FileEdit as Edit, Trash2, Plus, Save } from 'lucide-react';
import EditModal from '../components/EditModal';

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
  bod_din: string;
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

interface FPO {
  fpo_id: number;
  fpo_name: string;
  state_code: number | null;
  state_name: string | null;
  district_code: number | null;
  district_name: string | null;
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
  is_approved: boolean;
  donors: Array<{
    donor_type: 'government' | 'corporate' | 'others';
    donor_name: string;
  }>;
}

const AllFPCs: React.FC = () => {
  const [fpos, setFpos] = useState<FPO[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFPO, setSelectedFPO] = useState<FPO | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterState, setFilterState] = useState('');
  const [projectManagers, setProjectManagers] = useState<ProjectManager[]>([]);
  const [regionalManagers, setRegionalManagers] = useState<RegionalManager[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedStateCode, setSelectedStateCode] = useState<number | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateFPCRequestData>();

  useEffect(() => {
    fetchFPOs();
    fetchProjectManagers();
    fetchRegionalManagers();
    fetchDistricts();
  }, []);


  // yeh wala logic saab files me implement karna hai 
const fetchFPOs = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('/api/fpo/approved', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (Array.isArray(response.data) && response.data.length === 0) {
      setFpos([]); // still set it to empty array
      return; // don't show any toast
    }

    setFpos(response.data);
  } catch (error: any) {
    console.error('Error fetching FPOs:', error);
    // Show toast only for genuine errors
    if (error.response?.status !== 200) {
      toast.error(error.response?.data?.detail || 'Failed to fetch FPOs');
    } else {
      toast.error('Failed to fetch FPOs');
    }
  } finally {
    setLoading(false);
  }
};

  const fetchProjectManagers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/pm/', {
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
      const response = await axios.get('/api/rm/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setRegionalManagers(response.data);
    } catch (error: any) {
      console.error('Error fetching regional managers:', error);
      // toast.error('Failed to fetch regional managers');
    }
  };

  const fetchDistricts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/districts/districts', {
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

  const handleDelete = async (fpoId: number) => {
    if (window.confirm('Are you sure you want to delete this FPO? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/fpo/${fpoId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        toast.success('FPO deleted successfully!');
        fetchFPOs();
      } catch (error: any) {
        toast.error(error.response?.data?.detail || 'Failed to delete FPO');
      }
    }
  };

  const onSubmit = async (data: CreateFPCRequestData) => {
    setCreateLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Prepare the payload according to the API schema
      const payload = {
        ...data,
        is_approved: true,
        donors: [],
        bod_details: {
          mobile_number: data.bod_phone_number,
          fpo_id: 0,
          name: data.bod_name,
          gender: data.bod_gender,
          education_qualification: data.bod_qualification || "",
          din: data.bod_din,
          address: data.address || "",
          date_of_joining: data.bod_date_of_joining || null
        }
      };

      const response = await fetch('/api/fpo/', {
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
      setShowCreateForm(false);
      fetchFPOs(); // Refresh the list
      
    } catch (error: any) {
      console.error('Error creating FPC:', error);
      toast.error(error.message || 'Failed to create FPC');
    } finally {
      setCreateLoading(false);
    }
  };

// Filter FPOs based on search term and selected state
const filteredFPOs = fpos.filter(fpo => {
  const matchesSearch =
    fpo.fpo_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (fpo.district_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    fpo.fpc_registration_number.toLowerCase().includes(searchTerm.toLowerCase());

  const matchesState = filterState === '' || fpo.state_name === filterState;

  return matchesSearch && matchesState;
});

// Get unique states from FPOs
const uniqueStates = [...new Set(fpos.map(fpo => fpo.state_name))].filter(Boolean).sort();


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All FPCs</h1>
          <p className="text-gray-600">Manage all Farmer Producer Companies across regions</p>
        </div>
        <div className="text-sm text-gray-500">
          Total: {fpos.length} FPCs
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create New FPC</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by FPC name, district, or registration number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="w-full md:w-48">
            <select
              value={filterState}
              onChange={(e) => setFilterState(e.target.value)}
              className="form-input"
            >
              <option value="">All States</option>
              {uniqueStates.map(state => (
                <option key={state || ''} value={state || ''}>{state}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* FPO Grid */}
      <div className="grid gap-6">
        {filteredFPOs.length === 0 ? (
          <div className="card p-12 text-center">
            <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No FPCs found</h3>
            <p className="text-gray-600">
              {searchTerm || filterState ? 'Try adjusting your search criteria.' : 'No approved FPCs found.'}
            </p>
          </div>
        ) : (
          filteredFPOs.map((fpo) => (
            <div key={fpo.fpo_id} className="card p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <Building2 className="h-6 w-6 text-primary-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{fpo.fpo_name}</h3>
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500">Location</p>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                        <p className="font-medium">{fpo.district_name || 'N/A'}, {fpo.state_name || 'N/A'}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Registration Number</p>
                      <p className="font-medium">{fpo.fpc_registration_number}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Registration Date</p>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                        <p className="font-medium">{new Date(fpo.registration_date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Contact Person</p>
                      <p className="font-medium">{fpo.office_contact_name}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      <span className="text-xs">FPO Contact Number: {fpo.office_contact_number}</span>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-1" />
                      <span className="text-xs"> FPO Email ID: {fpo.office_contact_email}</span>
                    </div>
                    {fpo.responsible_wotr_staff_phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        <span className="text-xs">Regional Manager Phone: {fpo.responsible_wotr_staff_phone}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {fpo.donors.length} Donor{fpo.donors.length !== 1 ? 's' : ''}
                    </div>
                    
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>PAN: {fpo.pan}</span>
                    <span>TAN: {fpo.tan}</span>
                    <span>GST: {fpo.gst_number}</span>
                  </div>
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => {
                      setSelectedFPO(fpo);
                      setShowModal(true);
                    }}
                    className="btn-secondary flex items-center space-x-1"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedFPO(fpo);
                      setShowEditModal(true);
                    }}
                    className="btn-primary flex items-center space-x-1"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(fpo.fpo_id)}
                    className="btn-danger flex items-center space-x-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create FPC Form Modal */}
      {showCreateForm && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2 className="text-xl font-bold text-gray-900">Create New FPC</h2>
              <button
                onClick={() => {
                  setShowCreateForm(false);
                  reset();
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-8">
              {/* Basic FPC Information */}
              <div className="space-y-4">
                <h3 className="section-title">Basic FPC Information</h3>
                
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
                <h3 className="section-title">BOD Member Information</h3>
                
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

                        <div>
                    <label className="form-label">DIN</label>
                    <input
                      {...register('bod_din')}
                      className="form-input"
                      type='text'
                      placeholder="Enter DIN"
                    />
                  </div>




                </div>
              </div>

              {/* FPO Office Information */}
              <div className="space-y-4">
                <h3 className="section-title">FPO Office Information</h3>
                
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
                <h3 className="section-title">Registration Documents</h3>
                
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
                        // pattern: { value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'Invalid PAN format' }
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
                        // pattern: { value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, message: 'Invalid GST format' }
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
                  onClick={() => {
                    setShowCreateForm(false);
                    reset();
                  }}
                  className="btn-secondary"
                  disabled={createLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="btn-primary flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{createLoading ? 'Creating FPC...' : 'Create FPC'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {showModal && selectedFPO && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h2 className="text-xl font-bold text-gray-900">FPO Details</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <span className="sr-only">Close</span>
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">FPO Name</p>
                    <p className="font-medium">{selectedFPO.fpo_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Registration Number</p>
                    <p className="font-medium">{selectedFPO.fpc_registration_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">State</p>
                    <p className="font-medium">{selectedFPO.state_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">District</p>
                    <p className="font-medium">{selectedFPO.district_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Registration Date</p>
                    <p className="font-medium">{new Date(selectedFPO.registration_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Office Block</p>
                    <p className="font-medium">{selectedFPO.office_block}</p>
                  </div>
                </div>
              </div>

              {/* Legal Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Legal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">PAN</p>
                    <p className="font-medium">{selectedFPO.pan}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">TAN</p>
                    <p className="font-medium">{selectedFPO.tan}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">GST Number</p>
                    <p className="font-medium">{selectedFPO.gst_number}</p>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Address Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Registered Address</p>
                    <p className="font-medium">{selectedFPO.registered_company_address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Office Address</p>
                    <p className="font-medium">{selectedFPO.office_address}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">FPO Contact Person</p>
                    <p className="font-medium">{selectedFPO.office_contact_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">FPO Contact Number</p>
                    <p className="font-medium">{selectedFPO.office_contact_number}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">FPO Contact Email</p>
                    <p className="font-medium">{selectedFPO.office_contact_email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">WOTR Staff Phone</p>
                    <p className="font-medium">{selectedFPO.responsible_wotr_staff_phone}</p>
                  </div>
                </div>
              </div>

              {/* Donors */}
              {selectedFPO.donors && selectedFPO.donors.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Donors</h3>
                  <div className="space-y-2">
                    {selectedFPO.donors.map((donor, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{donor.donor_name}</p>
                          <p className="text-sm text-gray-500 capitalize">{donor.donor_type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {selectedFPO && (
        <EditModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          fpoId={selectedFPO.fpo_id}
          fpoName={selectedFPO.fpo_name}
        />
      )}
    </div>
  );
};

export default AllFPCs;