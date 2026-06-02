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
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, Plus, Edit, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminTorah() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const list = await base44.entities.DailyTorah.list('-date', 100);
    setItems(list);
    setLoading(false);
  };

  const openAdd = () => {
    setFormData({ date: '', title_ru: '', content_ru: '', title_he: '', status: 'draft', image_url: '', external_link: '' });
    setEditItem({});
  };

  const handleSave = async () => {
    if (!formData.date || !formData.title_ru || !formData.content_ru) {
      toast.error('Заполните дату, заголовок и текст');
      return;
    }
    const { id, created_date, updated_date, created_by_id, ...data } = formData;
    if (editItem?.id) {
      await base44.entities.DailyTorah.update(editItem.id, data);
      toast.success('Обновлено');
    } else {
      await base44.entities.DailyTorah.create(data);
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
          <h1 className="text-lg font-display font-bold flex-1">Ежедневная Тора</h1>
          <Button size="sm" onClick={openAdd}><Plus className="w-4 h-4 mr-1" />Добавить</Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-2">
        {loading ? (
          <div className="space-y-2">{Array(5).fill(0).map((_, i) => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}</div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground"><BookOpen className="w-12 h-12 mx-auto mb-2 opacity-30" /><p>Нет записей</p></div>
        ) : (
          items.map(item => (
            <Card key={item.id} className="cursor-pointer hover:shadow-md" onClick={() => { setFormData({...item}); setEditItem(item); }}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-sm">{item.title_ru}</p>
                  <p className="text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString('ru-RU')}</p>
                </div>
                <Badge variant={item.status === 'published' ? 'default' : 'secondary'}>{item.status === 'published' ? 'Опубл.' : 'Черновик'}</Badge>
                <Edit className="w-4 h-4 text-muted-foreground" />
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editItem?.id ? 'Редактировать' : 'Новая запись'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Дата</Label><Input type="date" value={formData.date || ''} onChange={e => setFormData({...formData, date: e.target.value})} /></div>
            <div><Label>Заголовок (рус)</Label><Input value={formData.title_ru || ''} onChange={e => setFormData({...formData, title_ru: e.target.value})} /></div>
            <div><Label>Заголовок (иврит)</Label><Input value={formData.title_he || ''} onChange={e => setFormData({...formData, title_he: e.target.value})} className="hebrew-text" /></div>
            <div><Label>Текст (рус, markdown)</Label><Textarea rows={6} value={formData.content_ru || ''} onChange={e => setFormData({...formData, content_ru: e.target.value})} /></div>
            <div><Label>URL картинки</Label><Input value={formData.image_url || ''} onChange={e => setFormData({...formData, image_url: e.target.value})} /></div>
            <div><Label>Внешняя ссылка</Label><Input value={formData.external_link || ''} onChange={e => setFormData({...formData, external_link: e.target.value})} /></div>
            <div>
              <Label>Статус</Label>
              <Select value={formData.status || 'draft'} onValueChange={v => setFormData({...formData, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Черновик</SelectItem>
                  <SelectItem value="published">Опубликовано</SelectItem>
                </SelectContent>
              </Select>
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