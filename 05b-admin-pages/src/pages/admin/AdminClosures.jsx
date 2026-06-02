import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { formatDateTime } from '@/lib/campaign';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Plus, Edit, Trash2, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminClosures() {
  const [periods, setPeriods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const list = await base44.entities.ClosurePeriod.list('-start_time', 50);
    setPeriods(list);
    setLoading(false);
  };

  const openAdd = () => {
    setFormData({ start_time: '', end_time: '', type: 'shabbos', name_ru: '', notes: '', custom_message: '', retrospective_deadline: '' });
    setEditItem({});
  };

  const openEdit = (p) => {
    setFormData({ ...p });
    setEditItem(p);
  };

  const handleSave = async () => {
    if (!formData.start_time || !formData.end_time) {
      toast.error('Укажите время начала и конца');
      return;
    }
    const { id, created_date, updated_date, created_by_id, ...data } = formData;
    if (editItem?.id) {
      await base44.entities.ClosurePeriod.update(editItem.id, data);
      toast.success('Период обновлён');
    } else {
      await base44.entities.ClosurePeriod.create(data);
      toast.success('Период добавлен');
    }
    setEditItem(null);
    await loadData();
  };

  const handleDelete = async (id) => {
    await base44.entities.ClosurePeriod.delete(id);
    toast.success('Период удалён');
    await loadData();
  };

  const typeLabels = { shabbos: 'Шаббат', holiday: 'Праздник', custom: 'Другое' };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card border-b">
        <div className="flex items-center gap-3 px-4 py-3 max-w-4xl mx-auto">
          <Link to="/admin"><Button variant="ghost" size="icon"><ChevronLeft className="w-5 h-5" /></Button></Link>
          <h1 className="text-lg font-display font-bold flex-1">Расписание Шаббата</h1>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Добавить</Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-2">
        <p className="text-sm text-muted-foreground bg-secondary/10 rounded-lg p-3">
          ⚠️ Замените демо-данные на точное время зажигания свечей и окончания Шаббата по Омску перед запуском
        </p>

        {loading ? (
          <div className="space-y-2">{Array(3).fill(0).map((_, i) => <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />)}</div>
        ) : periods.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Нет записей</div>
        ) : (
          periods.map(p => (
            <Card key={p.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-primary" />
                      <span className="font-semibold">{p.name_ru || typeLabels[p.type]}</span>
                      <Badge variant="secondary" className="text-xs">{typeLabels[p.type]}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{formatDateTime(p.start_time)} — {formatDateTime(p.end_time)}</p>
                    {p.notes && <p className="text-xs text-muted-foreground mt-1">{p.notes}</p>}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Edit className="w-4 h-4" /></Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Удалить период?</AlertDialogTitle>
                          <AlertDialogDescription>Это действие нельзя отменить.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(p.id)}>Удалить</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editItem?.id ? 'Редактировать' : 'Новый период'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Название</Label><Input value={formData.name_ru || ''} onChange={e => setFormData({...formData, name_ru: e.target.value})} /></div>
            <div>
              <Label>Тип</Label>
              <Select value={formData.type || 'shabbos'} onValueChange={v => setFormData({...formData, type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="shabbos">Шаббат</SelectItem>
                  <SelectItem value="holiday">Праздник</SelectItem>
                  <SelectItem value="custom">Другое</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Начало</Label><Input type="datetime-local" value={formData.start_time?.slice(0, 16) || ''} onChange={e => setFormData({...formData, start_time: e.target.value})} /></div>
            <div><Label>Конец</Label><Input type="datetime-local" value={formData.end_time?.slice(0, 16) || ''} onChange={e => setFormData({...formData, end_time: e.target.value})} /></div>
            <div><Label>Дедлайн ретроспективы</Label><Input type="datetime-local" value={formData.retrospective_deadline?.slice(0, 16) || ''} onChange={e => setFormData({...formData, retrospective_deadline: e.target.value})} /></div>
            <div><Label>Заметки</Label><Textarea value={formData.notes || ''} onChange={e => setFormData({...formData, notes: e.target.value})} /></div>
            <div><Label>Своё сообщение закрытия</Label><Textarea value={formData.custom_message || ''} onChange={e => setFormData({...formData, custom_message: e.target.value})} placeholder="Если пусто — стандартное сообщение" /></div>
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