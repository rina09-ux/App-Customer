import React from 'react';
import {
  Home,
  ShoppingBag,
  Cloud,
  ShieldAlert,
  GitFork,
  FileCheck2,
  Atom,
  Code2,
  CreditCard,
  Settings,
  Bell,
  Sun,
  Moon
} from 'lucide-react';
import { NavigationSection } from '../types';
import { useTheme } from '../context/ThemeContext';

interface IconRailProps {
  currentSection: NavigationSection;
  onSelectSection: (section: NavigationSection) => void;
  onOpenNotifications?: () => void;
  unreadCount?: number;
}

export const IconRail: React.FC<IconRailProps> = ({
  currentSection,
  onSelectSection,
  onOpenNotifications,
  unreadCount = 3
}) => {
  const { isDark, toggleTheme } = useTheme();

  const topNavItems = [
    { icon: Home, section: 'overview' as NavigationSection, label: 'Overview' },
    { icon: ShoppingBag, section: 'marketplace' as NavigationSection, label: 'Marketplace' },
    { icon: Cloud, section: 'assets-cloud' as NavigationSection, label: 'Assets & Cloud' },
    { icon: ShieldAlert, section: 'risk-exposure' as NavigationSection, label: 'Risk & Exposure' },
    { icon: GitFork, section: 'attack-paths' as NavigationSection, label: 'Attack Paths' },
    { icon: FileCheck2, section: 'compliance' as NavigationSection, label: 'Compliance & Trust' },
    { icon: Atom, section: 'pqc-readiness' as NavigationSection, label: 'PQC Quantum' },
    { icon: Code2, section: 'pqc-api' as NavigationSection, label: 'Developer API' },
    { icon: CreditCard, section: 'billing' as NavigationSection, label: 'Billing & Plans' },
    { icon: Settings, section: 'settings' as NavigationSection, label: 'Settings' }
  ];

  return (
    <aside
      id="icon-rail"
      className="w-16 ns-icon-rail flex flex-col items-center justify-between py-4 select-none shrink-0 z-20 transition-colors duration-200"
    >
      <div className="flex flex-col items-center gap-4 w-full">
        <button
          id="brand-logo-btn"
          onClick={() => onSelectSection('overview')}
          className="ds-primary w-10 h-10 !min-h-0 rounded-xl flex items-center justify-center transition-transform active:scale-95 shadow-sm group"
          title="NusaSec Customer Tower"
        >
          <div className="flex items-center gap-1" aria-hidden="true">
            <span className="w-1 h-4 bg-white rounded-full" />
            <span className="w-1 h-5 bg-white/80 rounded-full" />
            <span className="w-1 h-4 bg-white rounded-full" />
          </div>
        </button>

        <div className="w-8 h-px bg-slate-200/80 dark:bg-slate-800 my-1" />

        <div className="flex flex-col items-center gap-1 w-full px-2">
          {topNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.section ||
              (item.section === 'settings' && currentSection === 'preference') ||
              (item.section === 'billing' && currentSection === 'pricing');

            return (
              <button
                key={item.section}
                id={`icon-rail-${item.section}`}
                onClick={() => onSelectSection(item.section)}
                aria-current={isActive ? 'page' : undefined}
                data-active={isActive ? 'true' : undefined}
                className={`ds-nav-item w-10 h-10 !min-h-0 rounded-xl flex items-center justify-center transition-all duration-150 relative group ${isActive ? 'shadow-xs' : ''}`}
                title={item.label}
              >
                <Icon className="w-5 h-5 stroke-[1.8]" />
                <div className="ds-tooltip absolute left-14 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap shadow-md text-xs font-semibold px-2.5 py-1 rounded-lg">
                  {item.label}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 w-full px-2">
        <button
          id="icon-rail-theme-toggle"
          onClick={toggleTheme}
          className="ds-secondary w-10 h-10 !min-h-0 !px-0 rounded-xl flex items-center justify-center transition-colors border-0 bg-transparent"
          title={isDark ? 'Beralih ke Mode Terang (Light)' : 'Beralih ke Mode Gelap (Dark)'}
        >
          {isDark ? (
            <Sun className="w-5 h-5 text-amber-400 stroke-[1.8]" />
          ) : (
            <Moon className="w-5 h-5 ds-body stroke-[1.8]" />
          )}
        </button>

        <button
          id="icon-rail-notifications"
          onClick={() => {
            if (onOpenNotifications) onOpenNotifications();
            else onSelectSection('notifications');
          }}
          className="ds-secondary w-10 h-10 !min-h-0 !px-0 rounded-xl flex items-center justify-center relative transition-colors border-0 bg-transparent"
          title="Notifications & Alerts"
        >
          <Bell className="w-5 h-5 ds-body stroke-[1.8]" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-600 rounded-full ring-2 ring-white dark:ring-slate-900" />
          )}
        </button>

        <button
          id="icon-rail-user-profile"
          onClick={() => onSelectSection('organization')}
          className="w-9 h-9 rounded-xl overflow-hidden p-0.5 border border-[var(--ds-border)] bg-[var(--ds-brand-soft)] shadow-xs transition-transform hover:scale-105 active:scale-95"
          title="Organization & SOC Profile"
        >
          <div className="w-full h-full rounded-[8px] ds-primary flex items-center justify-center font-bold text-xs !min-h-0">
            NA
          </div>
        </button>
      </div>
    </aside>
  );
};
