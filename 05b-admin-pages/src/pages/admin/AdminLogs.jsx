import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, FileText } from 'lucide-react';

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.AdminLog.list('-created_date', 100)
      .then(list => { setLogs(list); setLoading(false); });
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card border-b">
        <div className="flex items-center gap-3 px-4 py-3 max-w-4xl mx-auto">
          <Link to="/admin"><Button variant="ghost" size="icon"><ChevronLeft className="w-5 h-5" /></Button></Link>
          <h1 className="text-lg font-display font-bold flex-1">Журнал действий</h1>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-2">
        {loading ? (
          <div className="space-y-2">{Array(5).fill(0).map((_, i) => <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />)}</div>
        ) : logs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>Нет записей</p>
          </div>
        ) : (
          logs.map(log => (
            <Card key={log.id}>
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium">{log.action}</p>
                    {log.details && <p className="text-xs text-muted-foreground">{log.details}</p>}
                    {log.reason && <p className="text-xs text-muted-foreground">Причина: {log.reason}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{log.admin_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(log.created_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}