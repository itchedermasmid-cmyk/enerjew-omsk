import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ChevronLeft, Plus, Edit } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminBadges() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const list = await base44.entities.Badge.list('sort_order', 50);
    setBadges(list);
    setLoading(false);
  };

  const handleSave = async () => {
    const { id, created_date, updated_date, created_by_id, ...data } = formData;
    if (editItem?.id) {
      await base44.entities.Badge.update(editItem.id, data);
      toast.success('Обновлено');
    } else {
      await base44.entities.Badge.create(data);
      toast.success('Добавлено');
    }
    setEditItem(null);
    await loadData();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card border-b">
        <div className="flex items-center gap-3 px-4 py-3 max-w-4xl mx-auto">
          <Link to="/admin"><Button variant="ghost" size="icon"><ChevronLeft className="w-5 h-5" /></Button></Link>
          <h1 className="text-lg font-display font-bold flex-1">Значки</h1>
          <Button size="sm" onClick={() => { setFormData({ name_ru: '', rule_type: 'streak', rule_threshold: 7, is_active: true }); setEditItem({}); }}>
            <Plus className="w-4 h-4 mr-1" />Добавить
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-2">
        {loading ? (
          <div className="space-y-2">{Array(5).fill(0).map((_, i) => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}</div>
        ) : (
          badges.map(b => (
            <Card key={b.id} className="cursor-pointer hover:shadow-md" onClick={() => { setFormData({...b}); setEditItem(b); }}>
              <CardContent className="p-4 flex items-center gap-3">
                <span className="text-2xl">{b.icon || '🏅'}</span>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{b.name_ru}</p>
                  <p className="text-xs text-muted-foreground">{b.description_ru}</p>
                </div>
                <Edit className="w-4 h-4 text-muted-foreground" />
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editItem?.id ? 'Редактировать' : 'Новый значок'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Название</Label><Input value={formData.name_ru || ''} onChange={e => setFormData({...formData, name_ru: e.target.value})} /></div>
            <div><Label>Описание</Label><Textarea value={formData.description_ru || ''} onChange={e => setFormData({...formData, description_ru: e.target.value})} /></div>
            <div><Label>Иконка (эмодзи)</Label><Input value={formData.icon || ''} onChange={e => setFormData({...formData, icon: e.target.value})} /></div>
            <div>
              <Label>Тип правила</Label>
              <Select value={formData.rule_type || 'streak'} onValueChange={v => setFormData({...formData, rule_type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="streak">Серия дней</SelectItem>
                  <SelectItem value="mitzvah_specific">Конкретная мицва</SelectItem>
                  <SelectItem value="bonus_count">Кол-во бонусов</SelectItem>
                  <SelectItem value="mission_progress">Прогресс миссии</SelectItem>
                  <SelectItem value="special">Особый</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Порог</Label><Input type="number" value={formData.rule_threshold || 0} onChange={e => setFormData({...formData, rule_threshold: Number(e.target.value)})} /></div>
            <div className="flex items-center justify-between">
              <Label>Активен</Label>
              <Switch checked={formData.is_active !== false} onCheckedChange={v => setFormData({...formData, is_active: v})} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditItem(null)}>Отмена</Button>
            <Button onClick={handleSave}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
