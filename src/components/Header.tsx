import React from 'react';
import { Menu } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-[#E5E7EB] lg:hidden">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-3">
          <button className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors">
            <Menu className="h-5 w-5 text-[#6B7280]" />
          </button>
          <h2 className="text-lg font-bold text-[#111827]">
            FPC Manager
          </h2>
        </div>
      </div>
    </header>
  );
};

export default Header;