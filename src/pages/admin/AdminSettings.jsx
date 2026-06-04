import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { DEFAULT_SETTINGS } from '@/lib/campaign';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ChevronLeft, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettings() {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadSettings(); }, []);

  const loadSettings = async () => {
    const all = await base44.entities.CampaignSettings.list('-created_date', 50);
    const map = {};
    all.forEach(s => { map[s.key] = s; });
    
    // Merge defaults with saved
    const merged = {};
    Object.entries(DEFAULT_SETTINGS).forEach(([key, defaultVal]) => {
      const savedValue = map[key]?.value;
      merged[key] = key === 'campaign_start' && savedValue === '2026-06-07'
        ? String(defaultVal)
        : savedValue ?? String(defaultVal);
    });
    
    setSettings(merged);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const existing = await base44.entities.CampaignSettings.list('-created_date', 50);
    const existingMap = {};
    existing.forEach(s => { existingMap[s.key] = s; });

    for (const [key, value] of Object.entries(settings)) {
      if (existingMap[key]) {
        await base44.entities.CampaignSettings.update(existingMap[key].id, { value: String(value) });
      } else {
        await base44.entities.CampaignSettings.create({ key, value: String(value) });
      }
    }
    
    toast.success('Настройки сохранены');
    setSaving(false);
  };

  const update = (key, value) => setSettings(prev => ({...prev, [key]: value}));

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card border-b">
        <div className="flex items-center gap-3 px-4 py-3 max-w-4xl mx-auto">
          <Link to="/admin"><Button variant="ghost" size="icon"><ChevronLeft className="w-5 h-5" /></Button></Link>
          <h1 className="text-lg font-display font-bold flex-1">Настройки кампании</h1>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-1" />{saving ? '...' : 'Сохранить'}
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold">Даты кампании</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Год</Label><Input value={settings.campaign_year} onChange={e => update('campaign_year', e.target.value)} /></div>
              <div><Label>Часовой пояс</Label><Input value={settings.timezone} onChange={e => update('timezone', e.target.value)} /></div>
              <div><Label>Начало</Label><Input type="date" value={settings.campaign_start} onChange={e => update('campaign_start', e.target.value)} /></div>
              <div><Label>Конец</Label><Input type="date" value={settings.campaign_end} onChange={e => update('campaign_end', e.target.value)} /></div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold">Правила</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Макс бонусов в день</Label><Input type="number" value={settings.max_daily_bonus} onChange={e => update('max_daily_bonus', e.target.value)} /></div>
              <div><Label>Порог миссии для спецприза (%)</Label><Input type="number" value={settings.special_prize_mission_threshold} onChange={e => update('special_prize_mission_threshold', e.target.value)} /></div>
              <div><Label>Порог бонусов для спецприза</Label><Input type="number" value={settings.special_prize_bonus_threshold} onChange={e => update('special_prize_bonus_threshold', e.target.value)} /></div>
            </div>
            <div className="flex items-center justify-between">
              <Label>Скрывать точные проценты</Label>
              <Switch checked={settings.hide_exact_percentages === 'true'} onCheckedChange={v => update('hide_exact_percentages', String(v))} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Разрешить смену миссии</Label>
              <Switch checked={settings.allow_mission_change === 'true'} onCheckedChange={v => update('allow_mission_change', String(v))} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold">Ретроспективные отметки</h3>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Дедлайн (день)</Label><Input value={settings.retro_deadline_day} onChange={e => update('retro_deadline_day', e.target.value)} /></div>
              <div><Label>Дедлайн (время)</Label><Input value={settings.retro_deadline_time} onChange={e => update('retro_deadline_time', e.target.value)} /></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
