import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Building2,
  Users,
  FileText,
  CheckSquare,
  Home,
  UserPlus,
  ClipboardList,
  Settings,
  UserCheck,
  Crown,
  Shield,
  DollarSign,
  Clock,
  XCircle,
  Warehouse,
  Menu,
  X
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const getNavigationItems = () => {
    const baseItems = [
      { name: 'Dashboard', href: '/', icon: Home, roles: ['super_admin', 'regional_manager', 'project_manager', 'fpc_user', 'agribusiness_officer'] },
    ];

    if (user?.role === 'super_admin') {
      return [
        ...baseItems,
        { name: 'All FPCs', href: '/all-fpcs', icon: Building2, roles: ['super_admin'] },
        { name: 'Approval Requests', href: '/approvals', icon: CheckSquare, roles: ['super_admin'] },
        { name: 'Regional Managers', href: '/regional-managers', icon: Users, roles: ['super_admin'] },
        { name: 'Project Managers', href: '/project-managers', icon: Users, roles: ['super_admin'] },
        { name: 'Agribusiness Officers', href: '/agribusiness-officer', icon: Users, roles: ['agribusiness_officer'] },

      ];
    }

    if (user?.role === 'regional_manager') {
      return [
        ...baseItems,
        { name: 'Create FPC Request', href: '/create-fpc', icon: UserPlus, roles: ['regional_manager'] },
        { name: 'My FPCs', href: '/my-requests', icon: ClipboardList, roles: ['regional_manager'] },
        { name: 'Pending Requests', href: '/pending-requests', icon: Clock, roles: ['regional_manager'] },
        { name: 'Rejected FPOs', href: '/rejected-fpos', icon: XCircle, roles: ['regional_manager'] },
        { name: 'Project Managers', href: '/project-managers', icon: Users, roles: ['regional_manager'] },
      ];
    }

    if (user?.role === 'project_manager') {
      return [
        ...baseItems,
        { name: 'My FPCs', href: '/my-requests', icon: ClipboardList, roles: ['project_manager'] },
      ];
    }

    if (user?.role === 'fpc_user') {
      return [
        ...baseItems,
        // { name: 'Complete Profile', href: '/complete-profile', icon: UserPlus, roles: ['fpc_user'] },
        { name: 'Shareholders', href: '/shareholder-form', icon: Users, roles: ['fpc_user'] },
        { name: 'Board of Directors', href: '/board-of-directors', icon: Crown, roles: ['fpc_user'] },
        { name: 'Staff', href: '/fpo-staff', icon: UserCheck, roles: ['fpc_user'] },
        { name: 'Financial Details', href: '/financial-form', icon: DollarSign, roles: ['fpc_user'] },
        { name: 'Compliance', href: '/compliance-form', icon: CheckSquare, roles: ['fpc_user'] },
        { name: 'Trainings', href: '/trainings', icon: Shield, roles: ['fpc_user'] },
        { name: 'Licenses', href: '/license-form', icon: FileText, roles: ['fpc_user'] },
        { name: 'Donors', href: '/donors', icon: Users, roles: ['fpc_user'] },
        { name: 'Facilities', href: '/facilities', icon: Warehouse, roles: ['fpc_user'] },
      ];
    }

    if (user?.role === 'agribusiness_officer') {
      return [
        ...baseItems,
        { name: 'FPC Agribusiness Data', href: '/agribusiness', icon: FileText, roles: ['agribusiness_officer'] },
      ];
    }



    return baseItems;
  };

  const navigation = getNavigationItems();

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 bg-white p-2 rounded-lg shadow-lg hover:bg-gray-100 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6 text-gray-700" />
      </button>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`bg-white w-64 shadow-lg fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Close button for mobile */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          aria-label="Close menu"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="flex items-center justify-center h-16 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">FPC Management</h1>
        </div>

        {user && (
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <p className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
         
          </div>
        )}

        <nav className="mt-8">
          <div className="px-4 space-y-2">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`
                }
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;