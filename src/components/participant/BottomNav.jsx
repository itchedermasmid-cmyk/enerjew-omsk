import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CalendarCheck, Star, TrendingUp, Trophy, BookOpen } from 'lucide-react';

const NAV_ITEMS = [
  { path: '/today', label: 'Сегодня', icon: CalendarCheck },
  { path: '/bonus', label: 'Бонус', icon: Star },
  { path: '/progress', label: 'Прогресс', icon: TrendingUp },
  { path: '/leaderboard', label: 'Рейтинг', icon: Trophy },
  { path: '/learn', label: 'Тора', icon: BookOpen },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50 safe-area-bottom">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {NAV_ITEMS.map(item => {
          const active = location.pathname === item.path || 
            (item.path === '/today' && location.pathname === '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-3 min-w-[60px] transition-colors ${
                active 
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'stroke-[2.5px]' : ''}`} />
              <span className={`text-[10px] mt-0.5 ${active ? 'font-semibold' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}