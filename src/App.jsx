import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import BackgroundCanvas from './components/BackgroundCanvas';
import Header from './components/Header';
import PosterIntro from './components/PosterIntro';
import ConstraintUnlockModal from './components/ConstraintUnlockModal';

// Public Pages
import PublicHome from './pages/PublicHome';
import ChallengesPage from './pages/ChallengesPage';
import ProblemDetail from './pages/ProblemDetail';
import RulesPage from './pages/RulesPage';
import EventTimerPage from './pages/EventTimerPage';

// Admin Pages
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminProblems from './pages/admin/AdminProblems';
import AdminConstraints from './pages/admin/AdminConstraints';
import AdminTimer from './pages/admin/AdminTimer';
import AdminSettings from './pages/admin/AdminSettings';
import AdminAuditLog from './pages/admin/AdminAuditLog';

import { api } from './services/api';
import { wsClient } from './services/websocket';
import { sounds } from './audio/sounds';
import { defaultEventData, defaultTimerData, defaultProblems } from './data/defaultEventData';

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  // Always show poster intro on entry to home route
  const [showPosterIntro, setShowPosterIntro] = useState(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get('skip') === '1') return false;
      if (sessionStorage.getItem('innovrush_entered') === 'true') return false;
      const path = window.location.pathname.replace(/\/+$/, '');
      const base = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');
      return path === '' || path === base || path === '/';
    }
    return true;
  });

  const [eventData, setEventData] = useState(defaultEventData);
  const [timerState, setTimerState] = useState(defaultTimerData);
  const [problems, setProblems] = useState(defaultProblems);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [constraintUnlockPayload, setConstraintUnlockPayload] = useState(null);

  // Fetch initial public state
  const fetchPublicData = async () => {
    try {
      const [evt, tmr, probs] = await Promise.all([
        api.getPublicEvent().catch(() => null),
        api.getPublicTimer().catch(() => null),
        api.getPublicProblems().catch(() => [])
      ]);
      if (evt) setEventData(evt);
      if (tmr) setTimerState(tmr);
      if (probs) setProblems(probs);
    } catch (e) {
      console.error('Data fetch error:', e);
    }
  };

  useEffect(() => {
    fetchPublicData();

    // Start WebSocket connection
    wsClient.connect();

    const unbindConn = wsClient.on('connection_change', ({ connected }) => {
      setIsWsConnected(connected);
    });

    const unbindInit = wsClient.on('INITIAL_SYNC', (data) => {
      if (data.event) {
        setEventData(prev => ({ ...prev, ...data.event }));
      }
      if (data.timer) {
        setTimerState(data.timer);
      }
    });

    // Real-time problem launch
    const unbindLaunch = wsClient.on('PROBLEM_LAUNCHED', (payload) => {
      fetchPublicData();
    });

    const unbindUnpublish = wsClient.on('PROBLEM_UNPUBLISHED', () => {
      fetchPublicData();
    });

    // Real-time timer update
    const unbindTimer = wsClient.on('TIMER_UPDATED', (payload) => {
      if (payload.payload?.timer) {
        setTimerState(payload.payload.timer);
      }
      if (payload.payload?.eventStatus && eventData) {
        setEventData(prev => ({ ...prev, status: payload.payload.eventStatus }));
      }
    });

    // Real-time surprise constraint release
    const unbindConstraints = wsClient.on('CONSTRAINTS_RELEASED', (payload) => {
      setConstraintUnlockPayload(payload.payload);
      fetchPublicData();
    });

    // Event status or rules update
    const unbindStatus = wsClient.on('EVENT_STATUS_UPDATED', (payload) => {
      setEventData(prev => ({ ...prev, status: payload.payload?.status }));
    });

    const unbindRules = wsClient.on('EVENT_RULES_UPDATED', (payload) => {
      setEventData(prev => ({ ...prev, rules: payload.payload?.rules }));
    });

    return () => {
      unbindConn();
      unbindInit();
      unbindLaunch();
      unbindUnpublish();
      unbindTimer();
      unbindConstraints();
      unbindStatus();
      unbindRules();
    };
  }, []);

  // Client-side local 1-second timer tick when running
  useEffect(() => {
    if (timerState?.status !== 'RUNNING') return;
    const interval = setInterval(() => {
      setTimerState(prev => {
        if (!prev || prev.status !== 'RUNNING') return prev;
        const nextRem = Math.max(0, prev.remainingSeconds - 1);
        return {
          ...prev,
          remainingSeconds: nextRem
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerState?.status]);

  const handleEnterArena = () => {
    sessionStorage.setItem('innovrush_entered', 'true');
    setShowPosterIntro(false);
  };

  const handleReplayIntro = () => {
    setShowPosterIntro(true);
  };

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="relative min-h-screen bg-obsidian text-softwhite flex flex-col font-sans selection:bg-metallic-gold selection:text-obsidian">
      
      {/* BACKGROUND CANVAS GRAPHIC */}
      <BackgroundCanvas />

      {/* POSTER INTRO OVERLAY */}
      {showPosterIntro && (
        <PosterIntro onEnter={handleEnterArena} />
      )}

      {/* CONSTRAINTS UNLOCK MODAL */}
      {constraintUnlockPayload && (
        <ConstraintUnlockModal
          payload={constraintUnlockPayload}
          onClose={() => setConstraintUnlockPayload(null)}
          onViewDetails={() => {
            setConstraintUnlockPayload(null);
            navigate('/challenges');
          }}
        />
      )}

      {/* PUBLIC NAVBAR (Only shown on non-admin routes) */}
      {!isAdminRoute && (
        <Header
          eventStatus={eventData?.status}
          timerState={timerState}
          onReplayIntro={handleReplayIntro}
        />
      )}

      {/* ROUTES */}
      <main className="flex-1 z-10 relative">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PublicHome
                eventData={eventData}
                problems={problems}
                timerState={timerState}
                onReplayIntro={handleReplayIntro}
              />
            }
          />
          <Route
            path="/challenges"
            element={
              <ChallengesPage
                problems={problems}
                timerState={timerState}
              />
            }
          />
          <Route
            path="/challenges/:problemId"
            element={<ProblemDetail timerState={timerState} />}
          />
          <Route
            path="/rules"
            element={<RulesPage rules={eventData?.rules} coordinators={eventData?.coordinators} />}
          />
          <Route
            path="/event/timer"
            element={<EventTimerPage timerState={timerState} eventStatus={eventData?.status} />}
          />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout isWsConnected={isWsConnected} />}>
            <Route index element={<AdminOverview />} />
            <Route path="problems" element={<AdminProblems />} />
            <Route path="constraints" element={<AdminConstraints />} />
            <Route path="timer" element={<AdminTimer />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="audit-log" element={<AdminAuditLog />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* MINIMAL FOOTER FOR PUBLIC SITE */}
      {!isAdminRoute && (
        <footer className="border-t border-metallic-gold/15 bg-obsidian/90 py-8 px-4 z-10 relative text-center">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-mutedsilver">
            <div>
              <span className="text-metallic-bright font-bold">INNOVRUSH 2K26</span> · N.B.K.R Institute of Science & Technology (Autonomous)
            </div>
            <div className="flex items-center gap-4 text-metallic-gold">
              <a href="mailto:nexusverse@nbkrist.org" className="hover:text-metallic-bright transition-colors">nexusverse@nbkrist.org</a>
              <span>·</span>
              <span>@nexusverse_ieee</span>
            </div>
          </div>
        </footer>
      )}

    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AppContent />
    </BrowserRouter>
  );
}
