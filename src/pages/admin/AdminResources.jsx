import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ChevronLeft, Plus, Edit, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { mergeResources } from '@/lib/resourceContent';

export default function AdminResources() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const list = await base44.entities.Resource.list('sort_order', 50);
    setResources(mergeResources(list));
    setLoading(false);
  };

  const handleSave = async () => {
    const { id, created_date, updated_date, created_by_id, ...data } = formData;
    if (editItem?.id) {
      await base44.entities.Resource.update(editItem.id, data);
      toast.success('Обновлено');
    } else {
      await base44.entities.Resource.create(data);
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
          <h1 className="text-lg font-display font-bold flex-1">Ресурсы</h1>
          <Button size="sm" onClick={() => { setFormData({ title_ru: '', content_ru: '', needs_review: true, is_published: true }); setEditItem({}); }}>
            <Plus className="w-4 h-4 mr-1" />Добавить
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-2">
        {loading ? (
          <div className="space-y-2">{Array(5).fill(0).map((_, i) => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}</div>
        ) : (
          resources.map(r => (
            <Card key={r.id || r.slug} className="cursor-pointer hover:shadow-md" onClick={() => { setFormData({...r}); setEditItem(r); }}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex-1">
                  <p className="font-semibold text-sm">{r.title_ru}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{r.content_ru?.substring(0, 60)}</p>
                </div>
                {r.needs_review && <AlertTriangle className="w-4 h-4 text-secondary" />}
                <Edit className="w-4 h-4 text-muted-foreground" />
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <Dialog open={!!editItem} onOpenChange={() => setEditItem(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editItem?.id ? 'Редактировать ресурс' : 'Новый ресурс'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Заголовок</Label><Input value={formData.title_ru || ''} onChange={e => setFormData({...formData, title_ru: e.target.value})} /></div>
            <div><Label>Короткое описание</Label><Input value={formData.short_ru || ''} onChange={e => setFormData({...formData, short_ru: e.target.value})} /></div>
            <div><Label>Основной текст (markdown)</Label><Textarea rows={5} value={formData.content_ru || ''} onChange={e => setFormData({...formData, content_ru: e.target.value})} /></div>
            <div><Label>Текст на иврите</Label><Textarea rows={3} value={formData.hebrew_text || ''} onChange={e => setFormData({...formData, hebrew_text: e.target.value})} className="hebrew-text" /></div>
            <div><Label>Транслитерация</Label><Textarea rows={2} value={formData.transliteration || ''} onChange={e => setFormData({...formData, transliteration: e.target.value})} /></div>
            <div><Label>Перевод на русский</Label><Textarea rows={2} value={formData.translation_ru || ''} onChange={e => setFormData({...formData, translation_ru: e.target.value})} /></div>
            <div><Label>Инструкции</Label><Textarea rows={4} value={formData.instructions_ru || ''} onChange={e => setFormData({...formData, instructions_ru: e.target.value})} /></div>
            <div><Label>URL картинки</Label><Input value={formData.image_url || ''} onChange={e => setFormData({...formData, image_url: e.target.value})} /></div>
            <div><Label>Внешняя ссылка</Label><Input value={formData.external_link || ''} onChange={e => setFormData({...formData, external_link: e.target.value})} /></div>
            <div><Label>Порядок</Label><Input type="number" value={formData.sort_order || 0} onChange={e => setFormData({...formData, sort_order: Number(e.target.value)})} /></div>
            <div className="flex items-center justify-between">
              <Label>Требует проверки</Label>
              <Switch checked={formData.needs_review !== false} onCheckedChange={v => setFormData({...formData, needs_review: v})} />
            </div>
            <div className="flex items-center justify-between">
              <Label>Опубликовано</Label>
              <Switch checked={formData.is_published !== false} onCheckedChange={v => setFormData({...formData, is_published: v})} />
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
