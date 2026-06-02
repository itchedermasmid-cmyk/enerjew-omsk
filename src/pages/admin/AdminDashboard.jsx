import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { getOmskDate } from '@/lib/campaign';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Users, CheckCircle, Star, Trophy, Award, Gift, AlertCircle,
  Settings, Calendar, BookOpen, Shield, FileText, Clock, ChevronRight
} from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const today = getOmskDate();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const [participants, mainCheckins, bonusCheckins] = await Promise.all([
      base44.entities.Participant.filter({ status: 'active' }),
      base44.entities.MainCheckIn.filter({ eligible_date: today, is_valid: true }),
      base44.entities.BonusCheckIn.filter({ eligible_date: today, is_valid: true })
    ]);

    const active = participants.length;
    const todayMain = mainCheckins.length;
    const todayBonus = bonusCheckins.reduce((s, b) => s + (b.stars_awarded || 1), 0);
    const tripQualified = participants.filter(p => (p.mission_progress || 0) >= 80).length;
    const champions = participants.filter(p => p.progress_level === 'summer_champion').length;
    const specialPrize = participants.filter(p => p.special_prize_earned).length;
    
    // Haven't checked in for 3+ days (simple heuristic)
    const inactive = participants.filter(p => (p.current_streak || 0) === 0 && p.onboarding_complete).length;

    setStats({ active, todayMain, todayBonus, tripQualified, champions, specialPrize, inactive });
    setLoading(false);
  };

  const statCards = stats ? [
    { label: 'Активные участники', value: stats.active, icon: Users, color: 'text-primary' },
    { label: 'Отметки сегодня', value: stats.todayMain, icon: CheckCircle, color: 'text-success' },
    { label: 'Бонусы сегодня', value: stats.todayBonus, icon: Star, color: 'text-secondary' },
    { label: 'Поездка заслужена', value: stats.tripQualified, icon: Trophy, color: 'text-primary' },
    { label: 'Чемпионы лета', value: stats.champions, icon: Award, color: 'text-secondary' },
    { label: 'Спецприз', value: stats.specialPrize, icon: Gift, color: 'text-success' },
    { label: 'Без активности', value: stats.inactive, icon: AlertCircle, color: 'text-destructive' },
  ] : [];

  const menuItems = [
    { label: 'Участники', path: '/admin/participants', icon: Users },
    { label: 'Мицвот', path: '/admin/mitzvahs', icon: Shield },
    { label: 'Настройки кампании', path: '/admin/settings', icon: Settings },
    { label: 'Расписание Шаббата', path: '/admin/closures', icon: Clock },
    { label: 'Ежедневная Тора', path: '/admin/torah', icon: BookOpen },
    { label: 'Ресурсы', path: '/admin/resources', icon: FileText },
    { label: 'Значки', path: '/admin/badges', icon: Award },
    { label: 'Журнал действий', path: '/admin/logs', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card border-b">
        <div className="flex items-center justify-between px-4 py-3 max-w-4xl mx-auto">
          <div>
            <h1 className="text-lg font-display font-bold">Панель администратора</h1>
            <p className="text-xs text-muted-foreground">EnerJew Omsk</p>
          </div>
          <Link to="/">
            <Button variant="outline" size="sm">← Приложение</Button>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-6">
        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {loading ? (
            Array(7).fill(0).map((_, i) => (
              <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
            ))
          ) : (
            statCards.map((s, i) => {
              const Icon = s.icon;
              return (
                <Card key={i}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-4 h-4 ${s.color}`} />
                      <span className="text-xs text-muted-foreground">{s.label}</span>
                    </div>
                    <p className="text-2xl font-bold">{s.value}</p>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Menu */}
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Управление</h2>
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <Link key={item.path} to={item.path}>
                <Card className="hover:shadow-md transition-all cursor-pointer mb-2">
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="flex-1 font-medium">{item.label}</span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}