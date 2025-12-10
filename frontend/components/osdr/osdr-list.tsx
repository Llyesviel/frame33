'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { useOSDR } from '@/hooks/use-osdr';
import { Database, ExternalLink, Search, Filter } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function OSDRList() {
  const { datasets, total, loading, error, refetch } = useOSDR();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [itemsPerPage, setItemsPerPage] = useState('20');

  useEffect(() => {
    // Fetch a larger list to enable client-side filtering effectively
    // Ideally backend should support search/filter
    refetch(100, 0); 
  }, [refetch]);

  const filteredDatasets = datasets.filter(ds => {
    const matchesSearch = (ds.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          ds.dataset_id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || (ds.status || '').toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  }).slice(0, parseInt(itemsPerPage));

  // Extract unique statuses for filter
  const uniqueStatuses = Array.from(new Set(datasets.map(d => d.status).filter(Boolean)));

  if (loading && datasets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Database className="h-5 w-5" />
            NASA OSDR наборы данных
          </CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
                <Database className="h-5 w-5" />
                NASA OSDR наборы данных
            </CardTitle>
            <Badge variant="secondary">{filteredDatasets.length} / {total}</Badge>
            </div>
            <CardDescription>Репозиторий открытых данных</CardDescription>
            
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Поиск по названию или ID..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <div className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            <SelectValue placeholder="Статус" />
                        </div>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Все статусы</SelectItem>
                        {uniqueStatuses.map(status => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={itemsPerPage} onValueChange={setItemsPerPage}>
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder="Кол-во" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="10">10 шт.</SelectItem>
                        <SelectItem value="20">20 шт.</SelectItem>
                        <SelectItem value="30">30 шт.</SelectItem>
                        <SelectItem value="40">40 шт.</SelectItem>
                        <SelectItem value="50">50 шт.</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredDatasets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Database className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Нет доступных наборов данных</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-3 pr-4">
              {filteredDatasets.map((dataset) => (
                <OSDRItem key={dataset.dataset_id} dataset={dataset} />
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

function OSDRItem({ dataset }: { dataset: { dataset_id: string; title: string; status: string; updated_at: string } }) {
  return (
    <div className="flex items-start justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
      <div className="space-y-1 min-w-0 flex-1">
        <p className="font-medium text-sm truncate">{dataset.title || dataset.dataset_id}</p>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {dataset.dataset_id}
          </Badge>
          {dataset.status && (
            <Badge variant="secondary" className="text-xs">
              {dataset.status}
            </Badge>
          )}
        </div>
      </div>
      <a
        href={`https://osdr.nasa.gov/bio/repo/data/studies/${dataset.dataset_id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-foreground transition-colors ml-2"
      >
        <ExternalLink className="h-4 w-4" />
      </a>
    </div>
  );
}

export { OSDRList as default };
