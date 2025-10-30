import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { 
  Building2, 
  Users, 
  FileText, 
  TrendingUp,
  AlertCircle,
  CheckSquare,
  Clock
} from 'lucide-react';

interface Stats {
  totalFPCs: number;
  pendingRequests: number;
  approvedRequests: number;
  activeProjects: number;
  totalShareholders?: number;
  totalCEOs?: number;
  totalLicenses?: number;
  totalFinancialRecords?: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalFPCs: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    activeProjects: 0,
    totalShareholders: 0,
    totalCEOs: 0,
    totalLicenses: 0,
    totalFinancialRecords: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      let totalFPCs = 0;
      let pendingRequests = 0;
      let approvedRequests = 0;

      // For Super Admin, fetch dynamic counts
      if (user?.role === 'super_admin') {
        try {
          // Fetch approved FPCs count
          const approvedResponse = await axios.get('http://localhost:5000/fpo/approved', { headers });
          approvedRequests = approvedResponse.data.length;
          totalFPCs = approvedRequests; // Total FPCs = Approved FPCs for now
        } catch (error) {
          console.log('Approved FPCs endpoint not accessible');
        }

        try {
          // Fetch pending FPCs count
          const pendingResponse = await axios.get('http://localhost:5000/fpo/pending', { headers });
          pendingRequests = pendingResponse.data.length;
          // Add pending to total count
          totalFPCs += pendingRequests;
        } catch (error) {
          console.log('Pending FPCs endpoint not accessible');
        }
      } else {
        // For other roles, try to fetch FPOs
        try {
          const fpoResponse = await axios.get('http://localhost:5000/fpo/approved', { headers });
          totalFPCs = fpoResponse.data.length;
          approvedRequests = totalFPCs;
        } catch (error) {
          console.log('FPO endpoint not accessible for this user');
        }
      }

      // Fetch additional stats for FPC users and admins
      let additionalStats = {};
      if (user?.role === 'fpc_user' || user?.role === 'super_admin') {
        try {
          const [shareholderRes, ceoRes, licenseRes, financialRes] = await Promise.allSettled([
            axios.get('http://localhost:5000/shareholder/', { headers }),
            axios.get('http://localhost:5000/ceo_details/', { headers }),
            axios.get('http://localhost:5000/licenses/', { headers }),
            axios.get('http://localhost:5000/financial_details/', { headers })
          ]);

          additionalStats = {
            totalShareholders: shareholderRes.status === 'fulfilled' ? shareholderRes.value.data.length : 0,
            totalCEOs: ceoRes.status === 'fulfilled' ? ceoRes.value.data.length : 0,
            totalLicenses: licenseRes.status === 'fulfilled' ? licenseRes.value.data.length : 0,
            totalFinancialRecords: financialRes.status === 'fulfilled' ? financialRes.value.data.length : 0
          };
        } catch (error) {
          console.log('Some endpoints not accessible');
        }
      }

      setStats({
        totalFPCs,
        pendingRequests,
        approvedRequests,
        activeProjects: user?.role === 'super_admin' ? 45 : user?.role === 'regional_manager' ? 25 : 4, // Mock data for now
        ...additionalStats
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Fallback to mock data
      setStats({
        totalFPCs: user?.role === 'super_admin' ? 70 : user?.role === 'regional_manager' ? 30 : 5,
        pendingRequests: user?.role === 'super_admin' ? 12 : 3,
        approvedRequests: user?.role === 'super_admin' ? 58 : 27,
        activeProjects: user?.role === 'super_admin' ? 45 : user?.role === 'regional_manager' ? 25 : 4
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatCards = () => {
    const baseCards = [
      {
        title: user?.role === 'super_admin' ? 'Total FPCs' : user?.role === 'regional_manager' ? 'My FPCs' : 'Assigned FPCs',
        value: stats.totalFPCs,
        icon: Building2,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100'
      }
    ];

    // Add FPC-specific stats for FPC users
    if (user?.role === 'fpc_user') {
      baseCards.push(
        {
          title: 'Total Shareholders',
          value: stats.totalShareholders || 0,
          icon: Users,
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        },
        {
          title: 'Active Licenses',
          value: stats.totalLicenses || 0,
          icon: FileText,
          color: 'text-purple-600',
          bgColor: 'bg-purple-100'
        },
        {
          title: 'Financial Records',
          value: stats.totalFinancialRecords || 0,
          icon: TrendingUp,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100'
        }
      );
    }

    if (user?.role === 'super_admin' || user?.role === 'regional_manager') {
      baseCards.push(
        {
          title: 'Pending Requests',
          value: stats.pendingRequests,
          icon: Clock,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100'
        },
        {
          title: 'Approved Requests',
          value: stats.approvedRequests,
          icon: CheckSquare,
          color: 'text-green-600',
          bgColor: 'bg-green-100'
        }
      );
    }

    baseCards.push({
      title: 'Active Projects',
      value: stats.activeProjects,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    });

    return baseCards;
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 capitalize">Welcome, {user?.firstName} ({user?.role.replace('_', ' ')})</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {getStatCards().map((stat, index) => (
          <div key={index} className="card p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {user?.role === 'super_admin' ? 'Admin Actions' : 
           user?.role === 'regional_manager' ? 'Regional Manager Actions' :
           user?.role === 'project_manager' ? 'Project Manager Actions' : 'FPC Actions'}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {user?.role === 'super_admin' && (
            <>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <CheckSquare className="h-8 w-8 text-primary-600 mb-2" />
                <h3 className="font-medium text-gray-900">Review Approvals</h3>
                <p className="text-sm text-gray-600">Review pending FPC registration requests</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <Building2 className="h-8 w-8 text-green-600 mb-2" />
                <h3 className="font-medium text-gray-900">Manage FPCs</h3>
                <p className="text-sm text-gray-600">View and manage all FPCs</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <Users className="h-8 w-8 text-purple-600 mb-2" />
                <h3 className="font-medium text-gray-900">User Management</h3>
                <p className="text-sm text-gray-600">Manage regional managers and users</p>
              </button>
            </>
          )}
          
          {user?.role === 'regional_manager' && (
            <>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <Building2 className="h-8 w-8 text-primary-600 mb-2" />
                <h3 className="font-medium text-gray-900">Create FPC Request</h3>
                <p className="text-sm text-gray-600">Submit new FPC registration request</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <FileText className="h-8 w-8 text-green-600 mb-2" />
                <h3 className="font-medium text-gray-900">Track Requests</h3>
                <p className="text-sm text-gray-600">Monitor status of submitted requests</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <Users className="h-8 w-8 text-purple-600 mb-2" />
                <h3 className="font-medium text-gray-900">Manage Team</h3>
                <p className="text-sm text-gray-600">Oversee project managers and FPCs</p>
              </button>
            </>
          )}

          {user?.role === 'project_manager' && (
            <>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <Building2 className="h-8 w-8 text-primary-600 mb-2" />
                <h3 className="font-medium text-gray-900">My FPCs</h3>
                <p className="text-sm text-gray-600">Manage assigned FPCs</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <FileText className="h-8 w-8 text-green-600 mb-2" />
                <h3 className="font-medium text-gray-900">Generate Reports</h3>
                <p className="text-sm text-gray-600">Create progress and status reports</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
                <h3 className="font-medium text-gray-900">Performance</h3>
                <p className="text-sm text-gray-600">Track FPC performance metrics</p>
              </button>
            </>
          )}

          {user?.role === 'fpc_user' && (
            <>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <Building2 className="h-8 w-8 text-primary-600 mb-2" />
                <h3 className="font-medium text-gray-900">FPO Management</h3>
                <p className="text-sm text-gray-600">Manage your FPO details and information</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <Users className="h-8 w-8 text-green-600 mb-2" />
                <h3 className="font-medium text-gray-900">Manage Members</h3>
                <p className="text-sm text-gray-600">Handle shareholder and member data</p>
              </button>
              <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
                <FileText className="h-8 w-8 text-purple-600 mb-2" />
                <h3 className="font-medium text-gray-900">Financial & Compliance</h3>
                <p className="text-sm text-gray-600">Track financial details and compliance status</p>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-green-600 mr-3" />
              <span className="text-sm text-gray-700">
                {user?.role === 'super_admin' ? 'New FPC request submitted by Regional Manager' :
                 user?.role === 'regional_manager' ? 'FPC request approved by Super Admin' :
                 user?.role === 'project_manager' ? 'New FPC assigned to your management' :
                 'Profile setup reminder - complete your FPC details'}
              </span>
            </div>
            <span className="text-xs text-gray-500">2 hours ago</span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-blue-600 mr-3" />
              <span className="text-sm text-gray-700">
                {user?.role === 'super_admin' ? '3 pending approval requests require attention' :
                 user?.role === 'regional_manager' ? 'Monthly report submission due in 3 days' :
                 user?.role === 'project_manager' ? 'FPC performance review scheduled' :
                 'Document verification pending'}
              </span>
            </div>
            <span className="text-xs text-gray-500">1 day ago</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;