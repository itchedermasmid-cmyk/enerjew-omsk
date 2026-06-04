import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Plus, Search, Edit, RotateCcw, ChevronLeft, Star, Target, Flame, Smartphone
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdminParticipants() {
  const [participants, setParticipants] = useState([]);
  const [mitzvahs, setMitzvahs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editDialog, setEditDialog] = useState(null);
  const [addDialog, setAddDialog] = useState(false);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const [p, m] = await Promise.all([
      base44.entities.Participant.list('-created_date', 200),
      base44.entities.Mitzvah.filter({ is_active: true })
    ]);
    setParticipants(p);
    setMitzvahs(m);
    setLoading(false);
  };

  const filtered = participants.filter(p =>
    p.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    p.nickname?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => {
    setFormData({ full_name: '', nickname: '', gender: 'male', pin_hash: '', status: 'active' });
    setAddDialog(true);
  };

  const openEdit = (p) => {
    setFormData({ ...p });
    setEditDialog(p);
  };

  const handleSave = async () => {
    setSaving(true);
    if (addDialog) {
      if (!formData.full_name || !formData.pin_hash) {
        toast.error('Заполните имя и PIN');
        setSaving(false);
        return;
      }
      await base44.entities.Participant.create(formData);
      toast.success('Участник добавлен');
      setAddDialog(false);
    } else if (editDialog) {
      const { id, created_date, updated_date, created_by_id, ...updateData } = formData;
      await base44.entities.Participant.update(editDialog.id, updateData);
      toast.success('Участник обновлён');
      setEditDialog(null);
    }
    await loadData();
    setSaving(false);
  };

  const resetPin = async (p) => {
    const newPin = prompt('Новый PIN (числа):');
    if (newPin && /^\d+$/.test(newPin)) {
      await base44.entities.Participant.update(p.id, { pin_hash: newPin });
      toast.success('PIN обновлён');
      await loadData();
    }
  };

  const resetDevice = async (p) => {
    if (!confirm(`Сбросить главный телефон для ${p.full_name}?`)) return;
    await base44.entities.Participant.update(p.id, {
      device_id: '',
      device_registered_at: '',
    });
    toast.success('Телефон сброшен');
    await loadData();
  };

  const getMitzvahName = (id) => mitzvahs.find(m => m.id === id)?.name_ru || '—';

  const dialogOpen = addDialog || !!editDialog;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card border-b">
        <div className="flex items-center gap-3 px-4 py-3 max-w-4xl mx-auto">
          <Link to="/admin"><Button variant="ghost" size="icon"><ChevronLeft className="w-5 h-5" /></Button></Link>
          <h1 className="text-lg font-display font-bold flex-1">Участники</h1>
          <Button size="sm" onClick={openAdd}>
            <Plus className="w-4 h-4 mr-1" />Добавить
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Поиск..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>

        {loading ? (
          <div className="space-y-2">{Array(5).fill(0).map((_, i) => <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Нет участников</div>
        ) : (
          <div className="space-y-2">
            {filtered.map(p => (
              <Card key={p.id}>
                <CardContent className="p-3 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                    p.status === 'active' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                  }`}>
                    {p.full_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{p.full_name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{getMitzvahName(p.main_mitzvah_id)}</span>
                      <span>•</span>
                      <Target className="w-3 h-3" /><span>{p.mission_progress || 0}%</span>
                      <Star className="w-3 h-3" /><span>{p.bonus_stars || 0}</span>
                      <Flame className="w-3 h-3" /><span>{p.current_streak || 0}</span>
                    </div>
                  </div>
                  <Badge variant={p.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                    {p.status === 'active' ? 'Актив' : 'Неактив'}
                  </Badge>
                  {p.device_id && (
                    <Badge variant="outline" className="hidden sm:inline-flex text-xs">
                      Телефон
                    </Badge>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => resetDevice(p)} title="Сбросить главный телефон">
                    <Smartphone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => resetPin(p)}>
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={() => { setEditDialog(null); setAddDialog(false); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{addDialog ? 'Добавить участника' : 'Редактировать'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Полное имя</Label>
              <Input value={formData.full_name || ''} onChange={e => setFormData({...formData, full_name: e.target.value})} />
            </div>
            <div>
              <Label>Никнейм (публичный)</Label>
              <Input value={formData.nickname || ''} onChange={e => setFormData({...formData, nickname: e.target.value})} />
            </div>
            <div>
              <Label>Пол</Label>
              <Select value={formData.gender || 'male'} onValueChange={v => setFormData({...formData, gender: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Мужской</SelectItem>
                  <SelectItem value="female">Женский</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {addDialog && (
              <div>
                <Label>PIN</Label>
                <Input type="text" inputMode="numeric" value={formData.pin_hash || ''} onChange={e => setFormData({...formData, pin_hash: e.target.value.replace(/\D/g, '')})} />
              </div>
            )}
            <div>
              <Label>Статус</Label>
              <Select value={formData.status || 'active'} onValueChange={v => setFormData({...formData, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Активный</SelectItem>
                  <SelectItem value="inactive">Неактивный</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editDialog && (
              <div>
                <Label>Главная мицва</Label>
                <Select value={formData.main_mitzvah_id || ''} onValueChange={v => setFormData({...formData, main_mitzvah_id: v, mission_selected: true})}>
                  <SelectTrigger><SelectValue placeholder="Выберите..." /></SelectTrigger>
                  <SelectContent>
                    {mitzvahs.map(m => <SelectItem key={m.id} value={m.id}>{m.name_ru}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditDialog(null); setAddDialog(false); }}>Отмена</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
