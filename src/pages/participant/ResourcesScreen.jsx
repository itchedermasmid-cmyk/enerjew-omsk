import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import ParticipantHeader from '@/components/participant/ParticipantHeader';
import BottomNav from '@/components/participant/BottomNav';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, ChevronRight, ChevronLeft, ExternalLink, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

export default function ResourcesScreen() {
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.Resource.filter({ is_published: true })
      .then(list => {
        setResources(list.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
        setLoading(false);
      });
  }, []);

  const filtered = resources.filter(r =>
    r.title_ru?.toLowerCase().includes(search.toLowerCase()) ||
    r.content_ru?.toLowerCase().includes(search.toLowerCase())
  );

  if (selected) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <ParticipantHeader title="Ресурсы" />
        <div className="max-w-lg mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => setSelected(null)} className="mb-3">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Назад
          </Button>
          
          <Card>
            {selected.image_url && (
              <img src={selected.image_url} alt="" className="w-full h-48 object-cover rounded-t-lg" />
            )}
            <CardContent className="p-5 space-y-4">
              <h2 className="text-xl font-display font-bold">{selected.title_ru}</h2>
              
              {selected.needs_review && (
                <div className="flex items-center gap-2 bg-secondary/10 rounded-lg p-2 text-sm text-secondary">
                  <AlertTriangle className="w-4 h-4" />
                  Текст требует проверки перед запуском
                </div>
              )}

              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{selected.content_ru}</ReactMarkdown>
              </div>

              {selected.hebrew_text && (
                <div className="bg-accent/30 rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Иврит</p>
                  <p className="hebrew-text text-lg leading-relaxed">{selected.hebrew_text}</p>
                </div>
              )}

              {selected.transliteration && (
                <div className="bg-muted rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Транслитерация</p>
                  <p className="italic">{selected.transliteration}</p>
                </div>
              )}

              {selected.translation_ru && (
                <div className="bg-muted rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">Перевод</p>
                  <p>{selected.translation_ru}</p>
                </div>
              )}

              {selected.instructions_ru && (
                <div>
                  <h3 className="font-semibold mb-2">Инструкции</h3>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{selected.instructions_ru}</ReactMarkdown>
                  </div>
                </div>
              )}

              {selected.external_link && (
                <a
                  href={selected.external_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  Дополнительная ссылка
                </a>
              )}
            </CardContent>
          </Card>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <ParticipantHeader title="Ресурсы" />
      
      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Поиск..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Ничего не найдено</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card
                  className="cursor-pointer hover:shadow-md transition-all"
                  onClick={() => setSelected(r)}
                >
                  <CardContent className="p-4 flex items-center gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{r.title_ru}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {r.content_ru?.substring(0, 80)}...
                      </p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      
      <BottomNav />
    </div>
  );
}