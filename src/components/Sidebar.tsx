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
  X,
  LogOut
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
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
        className={`bg-white w-64 border-r border-[#E5E7EB] fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out flex flex-col ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Close button for mobile */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="lg:hidden absolute top-6 right-6 text-[#6B7280] hover:text-[#111827] transition-colors"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Logo Section */}
        <div className="px-6 py-8 border-b border-[#E5E7EB]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-xl flex items-center justify-center">
              <Building2 className="h-6 w-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#111827]">FPC Manager</h1>
              <p className="text-xs text-[#6B7280]">WOTR System</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        {user && (
          <div className="px-6 py-4 border-b border-[#E5E7EB]">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-[#EFF6FF] flex items-center justify-center">
                <span className="text-sm font-semibold text-[#3B82F6]">
                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#111827] truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-[#6B7280] capitalize truncate">
                  {user.role.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation - Flex grow to push logout to bottom */}
        <nav className="flex-1 overflow-y-auto py-6">
          <div className="px-4 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  isActive ? 'nav-link-active' : 'nav-link'
                }
              >
                <item.icon className="h-5 w-5" strokeWidth={2} />
                <span className="text-sm">{item.name}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Logout Button - Pinned to bottom */}
        <div className="px-4 py-6 border-t border-[#E5E7EB] bg-[#F9FAFB]">
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-[#EF4444] hover:bg-[#FEF2F2] transition-all duration-200 font-medium"
          >
            <LogOut className="h-5 w-5" strokeWidth={2} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;