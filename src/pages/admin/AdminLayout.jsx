import React, { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Shield, Layers, AlertOctagon, Clock, Settings, FileText,
  LogOut, ExternalLink, Activity, Radio, Database
} from 'lucide-react';
import { getAdminToken, clearAdminToken } from '../../services/api';
import { sounds } from '../../audio/sounds';

export default function AdminLayout({ adminUser, onLogout, isWsConnected }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const token = getAdminToken();
    if (!token) {
      navigate('/admin/login');
    }
  }, [location.pathname, navigate]);

  const navItems = [
    { name: 'Overview', path: '/admin', icon: Activity },
    { name: 'Problem Management', path: '/admin/problems', icon: Layers },
    { name: 'Surprise Constraints', path: '/admin/constraints', icon: AlertOctagon },
    { name: 'Timer Control', path: '/admin/timer', icon: Clock },
    { name: 'Rule Settings', path: '/admin/settings', icon: Settings },
    { name: 'Audit Log', path: '/admin/audit-log', icon: FileText },
  ];

  const handleLogout = () => {
    sounds.playClick();
    clearAdminToken();
    if (onLogout) onLogout();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-obsidian text-softwhite flex flex-col">
      
      {/* TOP ADMIN BAR */}
      <header className="sticky top-0 z-40 w-full bg-deepspace/95 border-b border-metallic-gold/25 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          
          {/* BRANDING */}
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-obsidian border border-metallic-gold/40 text-metallic-bright">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-cinzel text-base font-bold text-gold-gradient uppercase tracking-wider">
                  INNOVRUSH ADMIN
                </span>
                <span className="px-2 py-0.5 rounded bg-metallic-gold/15 text-metallic-bright font-mono text-[9px] font-bold border border-metallic-gold/30">
                  LAUNCH COMMAND
                </span>
              </div>
              <span className="text-[10px] font-mono text-mutedsilver block">
                N.B.K.R.I.S.T (Autonomous) · Lead Administrator Console
              </span>
            </div>
          </div>

          {/* STATUS & ACTIONS */}
          <div className="flex items-center gap-4">
            
            {/* WS Live Heartbeat */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-obsidian border border-white/10 text-[10px] font-mono">
              <Radio className={`w-3 h-3 ${isWsConnected ? 'text-emerald-400 animate-pulse' : 'text-red-400'}`} />
              <span className={isWsConnected ? 'text-emerald-400' : 'text-red-400'}>
                {isWsConnected ? 'SYNC LIVE' : 'RECONNECTING'}
              </span>
            </div>

            {/* Supabase Status Pill */}
            <Link
              to="/admin/settings"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-obsidian border border-metallic-gold/30 text-[10px] font-mono text-metallic-gold hover:text-metallic-bright hover:border-metallic-gold transition-colors"
              title="Supabase Cloud Database Settings"
            >
              <Database className="w-3 h-3 text-emerald-400" />
              <span>SUPABASE</span>
            </Link>

            {/* Link to public website */}
            <Link
              to="/"
              target="_blank"
              className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono text-mutedsilver hover:text-softwhite hover:border-metallic-gold/40 transition-colors"
            >
              <span>Public Arena</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/30 border border-red-500/30 text-red-300 font-mono text-xs hover:bg-red-900/40 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>

          </div>

        </div>

        {/* SUBNAV TABS */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto py-1 border-t border-white/5 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-mono tracking-wider uppercase transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-metallic-gold/20 text-metallic-bright font-bold border border-metallic-gold/40 shadow-gold-sm'
                    : 'text-mutedsilver hover:text-softwhite hover:bg-white/5'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-metallic-bright' : 'text-mutedsilver'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>
      </header>

      {/* ADMIN CONTENT VIEW */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>

    </div>
  );
}
