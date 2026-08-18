'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useData } from '@/context/DataContext';
import { useToast } from '@/context/ToastContext';
import { useRouter } from 'next/navigation';
import {
  UserCheck,
  Shield,
  Layers,
  RefreshCw,
  ChevronUp,
  ChevronDown,
  GripVertical,
  X,
} from 'lucide-react';

export const DemoSwitcher: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentUser, switchDemoUser } = useAuth();
  const { resetToDefaults } = useData();
  const { showToast } = useToast();
  const router = useRouter();

  // Position state
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ startX: number; startY: number; posX: number; posY: number }>({
    startX: 0,
    startY: 0,
    posX: 16,
    posY: 100,
  });
  const hasMovedRef = useRef(false);
  const widgetRef = useRef<HTMLDivElement>(null);

  // Initialize position on client mount
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem('demo_switcher_pos') : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPosition(parsed);
        return;
      } catch {}
    }
    // Default position: top right on mobile or top right/bottom left on desktop
    const defaultY = typeof window !== 'undefined' ? Math.max(16, window.innerHeight - 76) : 100;
    setPosition({ x: 16, y: defaultY });
  }, []);

  // Save position
  const updatePosition = useCallback((newPos: { x: number; y: number }) => {
    setPosition(newPos);
    try {
      sessionStorage.setItem('demo_switcher_pos', JSON.stringify(newPos));
    } catch {}
  }, []);

  // Drag handlers using Pointer Events (works for both touch & mouse)
  const handlePointerDown = (e: React.PointerEvent) => {
    isDraggingRef.current = true;
    hasMovedRef.current = false;
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      posX: position?.x || 16,
      posY: position?.y || 100,
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;

    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      hasMovedRef.current = true;
    }

    const nextX = Math.min(
      Math.max(8, dragStartRef.current.posX + dx),
      (typeof window !== 'undefined' ? window.innerWidth : 400) - (widgetRef.current?.offsetWidth || 200) - 8
    );
    const nextY = Math.min(
      Math.max(8, dragStartRef.current.posY + dy),
      (typeof window !== 'undefined' ? window.innerHeight : 800) - (widgetRef.current?.offsetHeight || 40) - 8
    );

    updatePosition({ x: nextX, y: nextY });
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  const handleToggleOpen = () => {
    if (!hasMovedRef.current) {
      setIsOpen((prev) => !prev);
    }
  };

  const handleSwitch = (
    persona: 'admin' | 'coach' | 'member' | 'multi' | 'orphan' | 'banned',
    targetRoute: string
  ) => {
    switchDemoUser(persona);
    showToast(`Switched to demo persona: ${persona.toUpperCase()}`, 'Application context updated', 'info');
    router.push(targetRoute);
    setIsOpen(false);
  };

  const handleReset = () => {
    resetToDefaults();
    showToast('Mock data reset to initial defaults', 'All records restored', 'success');
  };

  if (!position) return null;

  // Determine if flyout opens upward or downward based on current screen position
  const isNearBottom = typeof window !== 'undefined' && position.y > window.innerHeight / 2;
  const isNearRight = typeof window !== 'undefined' && position.x > window.innerWidth / 2;

  return (
    <div
      ref={widgetRef}
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        touchAction: 'none',
      }}
      className="fixed top-0 left-0 z-50 font-sans select-none"
    >
      <div className="bg-white/95 backdrop-blur-md border border-slate-300/90 rounded-2xl shadow-xl overflow-visible transition-shadow hover:shadow-2xl">
        {/* Draggable Handle Bar */}
        <div
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          className="flex items-center gap-2 px-3 py-1.5 cursor-grab active:cursor-grabbing text-xs font-semibold text-slate-800 transition-colors"
        >
          <GripVertical className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
          <span className="text-[11px] text-slate-500 font-medium shrink-0">Persona:</span>
          <button
            type="button"
            onClick={handleToggleOpen}
            className="font-bold text-teal-800 truncate max-w-[120px] text-left hover:underline cursor-pointer"
          >
            {currentUser?.name || 'Guest'}
          </button>
          <button
            type="button"
            onClick={handleToggleOpen}
            className="p-1 -mr-1 hover:bg-slate-100 rounded-md transition-colors cursor-pointer text-slate-500"
          >
            {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Expandable Menu (Positioned Upward or Downward dynamically) */}
        {isOpen && (
          <div
            className={`absolute ${isNearBottom ? 'bottom-full mb-2' : 'top-full mt-2'} ${
              isNearRight ? 'right-0' : 'left-0'
            } w-64 bg-white border border-slate-300 rounded-2xl shadow-2xl p-2.5 z-50 flex flex-col gap-1 animate-in fade-in zoom-in-95`}
          >
            <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100 mb-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Switch Demo Persona
              </p>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            <button
              onClick={() => handleSwitch('coach', '/dashboard')}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-900 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-teal-700" />
                <span className="font-semibold">Coach (Rahul)</span>
              </div>
              <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Dashboard</span>
            </button>

            <button
              onClick={() => handleSwitch('admin', '/dashboard/admin')}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-900 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span className="font-semibold">Super Admin</span>
              </div>
              <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Admin</span>
            </button>

            <button
              onClick={() => handleSwitch('member', '/app')}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span className="font-semibold">Member (Aman)</span>
              </div>
              <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">1-Gym App</span>
            </button>

            <button
              onClick={() => handleSwitch('multi', '/app')}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-900 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-3.5 h-3.5 text-amber-600" />
                <span className="font-semibold">Multi-Gym (Rohan)</span>
              </div>
              <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Multi-Org</span>
            </button>

            <button
              onClick={() => handleSwitch('orphan', '/app')}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-900 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-3.5 h-3.5 text-rose-600" />
                <span className="font-semibold">Zero-Org (Priya)</span>
              </div>
              <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Restricted</span>
            </button>

            <button
              onClick={() => handleSwitch('banned', '/app')}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-900 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <UserCheck className="w-3.5 h-3.5 text-orange-600" />
                <span className="font-semibold">Banned Member</span>
              </div>
              <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Banned</span>
            </button>

            <div className="mt-2 pt-2 border-t border-slate-200">
              <button
                onClick={handleReset}
                className="w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Mock Data</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
