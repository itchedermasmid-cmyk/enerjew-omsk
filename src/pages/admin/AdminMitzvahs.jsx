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
import { ChevronLeft, Edit, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function AdminMitzvahs() {
  const [mitzvahs, setMitzvahs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const list = await base44.entities.Mitzvah.list('sort_order', 50);
    setMitzvahs(list);
    setLoading(false);
  };

  const openEdit = (m) => {
    setFormData({ ...m });
    setEditItem(m);
  };

  const handleSave = async () => {
    const { id, created_date, updated_date, created_by_id, ...data } = formData;
    if (editItem?.id) {
      await base44.entities.Mitzvah.update(editItem.id, data);
      toast.success('Мицва обновлена');
    } else {
      await base44.entities.Mitzvah.create(data);
      toast.success('Мицва добавлена');
    }
    setEditItem(null);
    await loadData();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card border-b">
        <div className="flex items-center gap-3 px-4 py-3 max-w-4xl mx-auto">
          <Link to="/admin"><Button variant="ghost" size="icon"><ChevronLeft className="w-5 h-5" /></Button></Link>
          <h1 className="text-lg font-display font-bold flex-1">Мицвот</h1>
          <Button size="sm" onClick={() => { setFormData({ name_ru: '', eligibility: 'all', frequency: 'daily', is_active: true, can_be_main: true, can_be_bonus: true }); setEditItem({}); }}>
            <Plus className="w-4 h-4 mr-1" />Добавить
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-2">
        {loading ? (
          <div className="space-y-2">{Array(5).fill(0).map((_, i) => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}</div>
        ) : (
          mitzvahs.map(m => (
            <Card key={m.id} className="cursor-pointer hover:shadow-md" onClick={() => openEdit(m)}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-semibold">{m.name_ru}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary" className="text-xs">{m.eligibility === 'all' ? 'Все' : m.eligibility === 'boys_only' ? 'Мальчики' : 'Девочки'}</Badge>
                    <Badge variant="secondary" className="text-xs">{m.frequency}</Badge>
                    {!m.is_active && <Badge variant="destructive" className="text-xs">Неактив</Badge>}
                  </div>
                </div>
                <Edit className="w-4 h-4 text-muted-foreground" />
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editItem?.id ? 'Редактировать мицву' : 'Новая мицва'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Название (рус)</Label><Input value={formData.name_ru || ''} onChange={e => setFormData({...formData, name_ru: e.target.value})} /></div>
            <div><Label>Название (иврит)</Label><Input value={formData.name_he || ''} onChange={e => setFormData({...formData, name_he: e.target.value})} className="hebrew-text" /></div>
            <div><Label>Транслитерация</Label><Input value={formData.name_translit || ''} onChange={e => setFormData({...formData, name_translit: e.target.value})} /></div>
            <div><Label>Описание</Label><Textarea value={formData.description_ru || ''} onChange={e => setFormData({...formData, description_ru: e.target.value})} /></div>
            <div>
              <Label>Доступность</Label>
              <Select value={formData.eligibility || 'all'} onValueChange={v => setFormData({...formData, eligibility: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все</SelectItem>
                  <SelectItem value="boys_only">Только мальчики</SelectItem>
                  <SelectItem value="girls_only">Только девочки</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Частота</Label>
              <Select value={formData.frequency || 'daily'} onValueChange={v => setFormData({...formData, frequency: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Ежедневно</SelectItem>
                  <SelectItem value="weekdays_only">Будние дни</SelectItem>
                  <SelectItem value="shabbos_only">Только Шаббат</SelectItem>
                  <SelectItem value="custom">Настраиваемые дни</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label>Активна</Label>
              <Switch checked={formData.is_active !== false} onCheckedChange={v => setFormData({...formData, is_active: v})} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Может быть основной</Label>
              <Switch checked={formData.can_be_main !== false} onCheckedChange={v => setFormData({...formData, can_be_main: v})} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Может быть бонусной</Label>
              <Switch checked={formData.can_be_bonus !== false} onCheckedChange={v => setFormData({...formData, can_be_bonus: v})} />
            </div>
            <div><Label>Порядок сортировки</Label><Input type="number" value={formData.sort_order || 0} onChange={e => setFormData({...formData, sort_order: Number(e.target.value)})} /></div>
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