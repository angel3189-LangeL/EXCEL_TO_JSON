
import React from 'react';
import { LayoutDashboard, FileJson, Settings, HelpCircle, Database } from 'lucide-react';

const Sidebar: React.FC = () => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: FileJson, label: 'Historial', active: false },
    { icon: Database, label: 'Mapeos', active: false },
    { icon: Settings, label: 'Ajustes', active: false },
  ];

  return (
    <aside className="w-20 bg-gray-900 flex flex-col items-center py-6 gap-8">
      <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center mb-4">
        <FileJson className="w-6 h-6 text-white" />
      </div>

      <nav className="flex-1 flex flex-col gap-6">
        {navItems.map((item, idx) => (
          <button
            key={idx}
            title={item.label}
            className={`p-3 rounded-xl transition-all duration-200 group relative
              ${item.active ? 'bg-indigo-600 text-white' : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'}`}
          >
            <item.icon className="w-6 h-6" />
            <span className="absolute left-16 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              {item.label}
            </span>
          </button>
        ))}
      </nav>

      <button className="p-3 text-gray-500 hover:text-gray-300">
        <HelpCircle className="w-6 h-6" />
      </button>
    </aside>
  );
};

export default Sidebar;
