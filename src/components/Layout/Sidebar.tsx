import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, TrendingUp, DollarSign,
  RotateCcw, Truck, Factory, BarChart3, Users, ChevronRight,
  Activity, Plug, BookOpen, Rocket,
} from 'lucide-react';

const NAV_CORE = [
  { to: '/',              icon: LayoutDashboard, label: 'Command Center' },
  { to: '/inventory',     icon: Package,         label: 'Inventory'       },
  { to: '/orders',        icon: ShoppingCart,    label: 'Orders'          },
  { to: '/forecast',      icon: TrendingUp,      label: 'Demand Forecast' },
  { to: '/unit-economics',icon: DollarSign,      label: 'Unit Economics'  },
  { to: '/returns',       icon: RotateCcw,       label: 'Returns'         },
  { to: '/vendors',       icon: Users,           label: 'Vendors'         },
  { to: '/logistics',     icon: Truck,           label: 'Logistics'       },
  { to: '/manufacturing', icon: Factory,         label: 'Manufacturing'   },
  { to: '/reports',       icon: BarChart3,       label: 'Reports'         },
];

const NAV_ADVANCED = [
  { to: '/integrations',    icon: Plug,      label: 'Integrations'    },
  { to: '/sops',            icon: BookOpen,  label: 'SOP Automation'  },
  { to: '/scale-readiness', icon: Rocket,    label: 'Scale Readiness' },
];

function NavItem({ to, icon: Icon, label }: { to: string; icon: typeof LayoutDashboard; label: string }) {
  return (
    <li>
      <NavLink
        to={to}
        end={to === '/'}
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group
          ${isActive
            ? 'bg-violet-600 text-white shadow-sm'
            : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <Icon size={16} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'} />
            <span className="flex-1">{label}</span>
            {isActive && <ChevronRight size={12} className="opacity-60" />}
          </>
        )}
      </NavLink>
    </li>
  );
}

export default function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 h-screen w-56 bg-slate-900 flex flex-col z-40 shadow-xl">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-700/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center shadow">
            <Activity size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">HealthFab</p>
            <p className="text-slate-400 text-[10px] font-medium tracking-wider uppercase">Ops Platform</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2">
        <p className="px-3 mb-2 text-[10px] font-semibold tracking-widest text-slate-500 uppercase">Core Modules</p>
        <ul className="space-y-0.5 mb-4">
          {NAV_CORE.map(item => <NavItem key={item.to} {...item} />)}
        </ul>

        <p className="px-3 mb-2 text-[10px] font-semibold tracking-widest text-slate-500 uppercase">Advanced</p>
        <ul className="space-y-0.5">
          {NAV_ADVANCED.map(item => <NavItem key={item.to} {...item} />)}
        </ul>
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-700/60">
        <p className="text-slate-600 text-[10px]">v2.0 · Series A · Jun 2026</p>
        <p className="text-slate-500 text-[10px] mt-0.5">13 modules · Full ops coverage</p>
      </div>
    </aside>
  );
}
