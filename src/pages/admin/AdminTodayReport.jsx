import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { getOmskDate } from '@/lib/campaign';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, CheckCircle, Star, AlertCircle, Users } from 'lucide-react';

const TABS = [
  { key: 'all', label: 'Все', icon: Users },
  { key: 'checked', label: 'Отметились', icon: CheckCircle },
  { key: 'bonus', label: 'Бонусы', icon: Star },
  { key: 'missing', label: 'Не отметились', icon: AlertCircle },
];

export default function AdminTodayReport() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const today = getOmskDate();

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [participants, mainCheckins, bonusCheckins] = await Promise.all([
      base44.entities.Participant.filter({ status: 'active' }),
      base44.entities.MainCheckIn.filter({ eligible_date: today, is_valid: true }),
      base44.entities.BonusCheckIn.filter({ eligible_date: today, is_valid: true }),
    ]);

    const checkedIds = new Set(mainCheckins.map(c => c.participant_id));
    const bonusMap = bonusCheckins.reduce((acc, b) => {
      acc[b.participant_id] = (acc[b.participant_id] || 0) + (b.stars_awarded || 1);
      return acc;
    }, {});

    const data = participants
      .filter(p => p.onboarding_complete)
      .map(p => ({
        ...p,
        checked_in: checkedIds.has(p.id),
        bonus_stars_today: bonusMap[p.id] || 0,
      }))
      .sort((a, b) => a.full_name.localeCompare(b.full_name, 'ru'));

    setRows(data);
    setLoading(false);
  };

  const filtered = rows.filter(p => {
    if (tab === 'checked') return p.checked_in;
    if (tab === 'bonus') return p.bonus_stars_today > 0;
    if (tab === 'missing') return !p.checked_in;
    return true;
  });

  const counts = {
    all: rows.length,
    checked: rows.filter(p => p.checked_in).length,
    bonus: rows.filter(p => p.bonus_stars_today > 0).length,
    missing: rows.filter(p => !p.checked_in).length,
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card border-b">
        <div className="flex items-center gap-3 px-4 py-3 max-w-4xl mx-auto">
          <Link to="/admin"><Button variant="ghost" size="icon"><ChevronLeft className="w-5 h-5" /></Button></Link>
          <div className="flex-1">
            <h1 className="text-lg font-display font-bold">Отчёт за сегодня</h1>
            <p className="text-xs text-muted-foreground">{today}</p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        {/* Tab bar */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {TABS.map(t => {
            const Icon = t.icon;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  tab === t.key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {t.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  tab === t.key ? 'bg-white/20' : 'bg-background'
                }`}>{counts[t.key]}</span>
              </button>
            );
          })}
        </div>

        {/* List */}
        {loading ? (
          <div className="space-y-2">{Array(6).fill(0).map((_, i) => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">Нет участников</div>
        ) : (
          <div className="space-y-2">
            {filtered.map(p => (
              <Card key={p.id}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    p.checked_in ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                  }`}>
                    {p.full_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{p.full_name}</p>
                    <p className="text-xs text-muted-foreground">
                      Прогресс {p.mission_progress || 0}% · Серия {p.current_streak || 0} дн.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {p.checked_in ? (
                      <Badge className="bg-success/10 text-success border-success/20 text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />Отметился
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground text-xs">
                        <AlertCircle className="w-3 h-3 mr-1" />Нет
                      </Badge>
                    )}
                    {p.bonus_stars_today > 0 && (
                      <Badge className="bg-secondary/10 text-secondary-foreground border-secondary/20 text-xs">
                        <Star className="w-3 h-3 mr-1" />+{p.bonus_stars_today}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}