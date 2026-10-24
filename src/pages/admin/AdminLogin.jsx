import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, Eye, EyeOff, ArrowRight, AlertCircle, Database, CheckCircle2, UserCheck } from 'lucide-react';
import { api } from '../../services/api';
import { getSupabaseConfig, supabaseAdminLogin, AUTHORIZED_ADMIN_EMAIL } from '../../services/supabase';
import { sounds } from '../../audio/sounds';

export default function AdminLogin({ onLoginSuccess }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [supabaseConfig, setSupabaseConfig] = useState(getSupabaseConfig());

  useEffect(() => {
    setSupabaseConfig(getSupabaseConfig());
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      sounds.playClick();

      const normalizedEmail = (email || '').toLowerCase().trim();

      // Client-side single-admin authorization gate
      if (normalizedEmail !== AUTHORIZED_ADMIN_EMAIL) {
        throw new Error('Access Denied: Only the authorized single administrator is permitted to access this console. Public sign-up and secondary users are strictly disabled.');
      }

      // If Supabase is configured, authenticate with Supabase Auth
      if (supabaseConfig.isConfigured) {
        try {
          await supabaseAdminLogin(normalizedEmail, password);
        } catch (supaErr) {
          // If Supabase rejects authentication or authorization
          throw new Error(`Supabase Auth failed: ${supaErr.message || 'Invalid administrator credentials'}`);
        }
      }

      // Authenticate with backend and obtain secure session JWT
      const res = await api.adminLogin(normalizedEmail, password);
      if (onLoginSuccess) {
        onLoginSuccess(res.admin);
      }
      navigate('/admin');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify administrator credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 z-10 relative">
      <div className="max-w-md w-full rounded-2xl bg-gradient-to-b from-deepspace to-obsidian border border-metallic-gold/35 p-8 shadow-gold-md backdrop-blur-xl relative overflow-hidden">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-metallic-bright to-transparent" />
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-metallic-gold/10 rounded-full blur-2xl pointer-events-none" />

        {/* HEADER */}
        <div className="text-center mb-7">
          <div className="w-12 h-12 mx-auto rounded-xl bg-obsidian border border-metallic-gold/40 flex items-center justify-center text-metallic-bright mb-3 shadow-gold-sm">
            <Shield className="w-6 h-6" />
          </div>
          <div className="font-mono text-[10px] tracking-widest text-metallic-gold uppercase">
            N.B.K.R.I.S.T · NEXUSVERSE 2K26
          </div>
          <h1 className="font-cinzel text-2xl font-black text-softwhite tracking-wider uppercase mt-1">
            Admin Control Center
          </h1>
          <p className="text-xs text-mutedsilver font-light mt-1">
            Single Lead Administrator Authentication & Authorization Console.
          </p>

          {/* Status Pills */}
          <div className="mt-3 flex items-center justify-center gap-2 flex-wrap">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-obsidian border border-emerald-500/30 text-[10px] font-mono text-emerald-400">
              <UserCheck className="w-3 h-3" />
              <span>Strict 1-Admin Policy</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-obsidian border border-metallic-gold/25 text-[10px] font-mono text-metallic-gold">
              <Database className="w-3 h-3 text-metallic-bright" />
              <span>Supabase</span>
              {supabaseConfig.isConfigured ? (
                <span className="flex items-center gap-1 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Connected
                </span>
              ) : (
                <span className="text-mutedsilver/80">· Dual-Engine</span>
              )}
            </div>
          </div>
        </div>

        {/* ERROR ALERT */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 flex items-start gap-2.5 text-xs text-red-300 font-mono">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-mutedsilver mb-1.5">
              Authorized Administrator Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-mutedsilver" />
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter administrator email..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-obsidian border border-metallic-gold/25 focus:border-metallic-gold focus:outline-none text-xs font-mono text-softwhite transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-mutedsilver mb-1.5">
              Secret Access Key / Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-mutedsilver" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-obsidian border border-metallic-gold/25 focus:border-metallic-gold focus:outline-none text-xs font-mono text-softwhite transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-mutedsilver hover:text-softwhite transition-colors"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-mutedsilver/80">
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <Shield className="w-3 h-3" /> Protected Single-Admin Access
              </span>
              <span>Sign-up Disabled</span>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-gold-gradient text-obsidian font-mono text-xs font-bold tracking-wider uppercase hover:shadow-gold-md hover:scale-[1.01] active:scale-95 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-spin w-4 h-4 border-2 border-obsidian border-t-transparent rounded-full" />
            ) : (
              <>
                <span>Authenticate Session</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* SECURITY FOOTNOTE */}
        <div className="mt-4 p-2.5 rounded-lg bg-obsidian/70 border border-white/5 text-[10px] font-mono text-mutedsilver/70 text-center">
          Notice: Registration is permanently disabled. Only the designated single administrator is authorized to access administrative controls.
        </div>

        {/* FOOTER */}
        <div className="mt-5 pt-3 border-t border-white/5 text-center flex items-center justify-between text-[11px] font-mono">
          <Link
            to="/"
            className="text-mutedsilver hover:text-metallic-gold transition-colors"
          >
            ← Public Website
          </Link>
          <span className="text-mutedsilver/60">
            Supabase Protected
          </span>
        </div>

      </div>
    </div>
  );
}
