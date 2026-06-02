import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import ParticipantHeader from '@/components/participant/ParticipantHeader';
import BottomNav from '@/components/participant/BottomNav';
import ResourceArtwork from '@/components/participant/ResourceArtwork';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { mergeResources, getResourceReviewNote } from '@/lib/resourceContent';
import { Search, ChevronRight, ChevronLeft, ExternalLink, AlertTriangle, CheckCircle2, BookMarked } from 'lucide-react';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

export default function ResourcesScreen() {
  const [resources, setResources] = useState([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    base44.entities.Resource.filter({ is_published: true })
      .then(list => setResources(mergeResources(list)))
      .catch(() => setResources(mergeResources([])))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const resourceSlug = searchParams.get('resource');
    if (resourceSlug && resources.length > 0) {
      setSelected(resources.find(resource => resource.slug === resourceSlug) || null);
    }
  }, [resources, searchParams]);

  const filtered = useMemo(() => resources.filter(resource => {
    const haystack = `${resource.title_ru || ''} ${resource.short_ru || ''} ${resource.content_ru || ''}`.toLowerCase();
    return haystack.includes(search.toLowerCase());
  }), [resources, search]);

  const openResource = (resource) => {
    setSelected(resource);
    setSearchParams({ resource: resource.slug });
  };

  const closeResource = () => {
    setSelected(null);
    setSearchParams({});
  };

  if (selected) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <ParticipantHeader title="Как выполнить мицву" />
        <div className="max-w-lg mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" onClick={closeResource} className="mb-3">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Все инструкции
          </Button>

          <Card className="overflow-hidden">
            {selected.image_url ? (
              <img src={selected.image_url} alt="" className="w-full h-56 object-cover" />
            ) : (
              <ResourceArtwork slug={selected.slug} />
            )}
            <CardContent className="p-5 space-y-5">
              <div>
                <Badge variant="secondary" className="mb-2">Памятка</Badge>
                <h2 className="text-2xl font-display font-bold leading-tight">{selected.title_ru}</h2>
                {selected.short_ru && <p className="text-sm text-muted-foreground mt-2">{selected.short_ru}</p>}
              </div>

              {selected.needs_review && (
                <div className="flex items-start gap-2 bg-secondary/10 rounded-xl p-3 text-sm text-foreground">
                  <AlertTriangle className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
                  <span>{getResourceReviewNote()}</span>
                </div>
              )}

              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{selected.content_ru}</ReactMarkdown>
              </div>

              {selected.hebrew_text && (
                <div className="bg-accent/40 rounded-xl p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Иврит</p>
                  <p className="hebrew-text whitespace-pre-line text-xl leading-relaxed">{selected.hebrew_text}</p>
                </div>
              )}

              {selected.transliteration && (
                <div className="bg-muted/70 rounded-xl p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Транслитерация</p>
                  <p className="text-sm italic leading-relaxed">{selected.transliteration}</p>
                </div>
              )}

              {selected.translation_ru && (
                <div className="bg-muted/70 rounded-xl p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Перевод</p>
                  <p className="text-sm leading-relaxed">{selected.translation_ru}</p>
                </div>
              )}

              {selected.shared_prefix && (
                <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-4 space-y-3">
                  <div>
                    <h3 className="font-display font-bold text-lg">{selected.shared_prefix.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{selected.shared_prefix.note}</p>
                  </div>
                  <div className="bg-card rounded-lg p-3 space-y-2 border">
                    <p className="hebrew-text text-lg">{selected.shared_prefix.hebrew}</p>
                    <p className="text-sm italic text-muted-foreground">{selected.shared_prefix.transliteration}</p>
                    <p className="text-sm">{selected.shared_prefix.translation}</p>
                  </div>
                </div>
              )}

              {selected.sections?.length > 0 && (
                <div className="space-y-3">
                  <div>
                    <h3 className="font-display font-bold text-lg">Выбери продукт</h3>
                    {selected.shared_prefix && (
                      <p className="text-sm text-muted-foreground mt-1">
                        После общего начала добавь окончание из подходящей карточки.
                      </p>
                    )}
                  </div>
                  {selected.sections.map(section => (
                    <div key={section.title} className="border rounded-xl p-4 space-y-2">
                      <div>
                        <p className="font-semibold">{section.title}</p>
                        <p className="text-sm text-primary">{section.subtitle}</p>
                      </div>
                      {selected.shared_prefix && (
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Добавь окончание
                        </p>
                      )}
                      <p className="hebrew-text text-lg">{section.hebrew}</p>
                      <p className="text-sm italic text-muted-foreground">{section.transliteration}</p>
                      <p className="text-sm">{section.translation}</p>
                    </div>
                  ))}
                </div>
              )}

              {selected.instructions_ru && (
                <div>
                  <h3 className="font-display font-bold text-lg mb-2">Как выполнить</h3>
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{selected.instructions_ru}</ReactMarkdown>
                  </div>
                </div>
              )}

              {selected.tips_ru?.length > 0 && (
                <div className="space-y-2">
                  {selected.tips_ru.map(tip => (
                    <div key={tip} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                      <span>{tip}</span>
                    </div>
                  ))}
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
      <ParticipantHeader title="Как выполнить мицву" />

      <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
        <div className="rounded-2xl bg-gradient-to-r from-primary to-primary/80 p-5 text-primary-foreground">
          <BookMarked className="w-7 h-7 mb-3" />
          <h2 className="text-xl font-display font-bold">Всё нужное всегда под рукой</h2>
          <p className="text-sm opacity-90 mt-1">Выбери мицву: здесь есть слова, перевод и понятная инструкция.</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Найти инструкцию..."
            value={search}
            onChange={event => setSearch(event.target.value)}
            className="pl-9"
          />
        </div>

        {loading ? (
          Array(4).fill(0).map((_, index) => (
            <div key={index} className="h-28 bg-muted rounded-xl animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Ничего не найдено</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((resource, index) => (
              <motion.div
                key={resource.id || resource.slug}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card
                  className="cursor-pointer overflow-hidden hover:shadow-md transition-all"
                  onClick={() => openResource(resource)}
                >
                  <CardContent className="p-0 flex items-center">
                    <div className="w-28 flex-shrink-0 overflow-hidden">
                      <ResourceArtwork slug={resource.slug} compact />
                    </div>
                    <div className="flex-1 min-w-0 p-3">
                      <p className="font-semibold text-sm leading-tight">{resource.title_ru}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{resource.short_ru || resource.content_ru}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground mr-3 flex-shrink-0" />
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
