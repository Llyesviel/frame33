'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useJWST } from '@/hooks/use-jwst';
import { Telescope, Search, ImageIcon } from 'lucide-react';
import type { JWSTImage } from '@/lib/types';

const INSTRUMENTS = ['Все', 'FGS', 'NIRCAM', 'NIRISS', 'NIRSPEC', 'MIRI'];
const SUFFIXES = ['Все', '_cal', '_i2d', '_rate', '_uncal'];

export function JWSTGallery() {
  const { images, loading, error, refetch } = useJWST();
  const [suffix, setSuffix] = useState<string>('');
  const [instrument, setInstrument] = useState<string>('');
  const [perPage, setPerPage] = useState<number>(12);

  useEffect(() => {
    refetch({ perPage: perPage });
  }, [refetch, perPage]);

  const handleFilter = () => {
    // Note: The new types might not support suffix/instrument filtering directly in params
    // Adjusting to match JWSTFeedParams interface
    refetch({
      perPage: perPage,
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Telescope className="h-5 w-5" />
            Изображения JWST
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={suffix} onValueChange={setSuffix}>
              <SelectTrigger className="min-w-[130px]">
                <SelectValue placeholder="Суффикс" />
              </SelectTrigger>
              <SelectContent>
                {SUFFIXES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={instrument} onValueChange={setInstrument}>
              <SelectTrigger className="min-w-[150px]">
                <SelectValue placeholder="Инструмент" />
              </SelectTrigger>
              <SelectContent>
                {INSTRUMENTS.map((i) => (
                  <SelectItem key={i} value={i}>
                    {i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={handleFilter} size="sm" disabled={loading}>
              <Search className="h-4 w-4 mr-1" />
              Фильтр
            </Button>
            
            <Select value={perPage.toString()} onValueChange={(val) => setPerPage(parseInt(val))}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Кол-во" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12</SelectItem>
                <SelectItem value="24">24</SelectItem>
                <SelectItem value="36">36</SelectItem>
                <SelectItem value="48">48</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-4/3" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>{error}</p>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Изображений не найдено</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {images.slice(0, perPage).map((image, index) => (
              <JWSTImageCard key={image.id || index} image={image} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function JWSTImageCard({ image }: { image: JWSTImage }) {
  const [hasError, setHasError] = useState(false);

  const baseTitle = image.observation_id || image.id;
  const instrumentsList =
    image.details?.instruments && image.details.instruments.length > 0
      ? image.details.instruments.map(i => (typeof i === 'string' ? i : i.instrument))
      : null;
  const instruments = instrumentsList?.map((i) => i.toUpperCase()).join(', ');
  const derivedSuffixFromId =
    image.id?.replace(/\.[^.]+$/, '').split('_').filter(Boolean).pop() || undefined;
  const suffix = image.details?.suffix || derivedSuffixFromId || image.file_type;
  const program = image.program ? `#${image.program}` : null;
  const description = image.details?.description;

  // Prefer location for images, skip non-image files (fits, json, etc.)
  const isImageFile =
    image.file_type === 'jpg' ||
    image.file_type === 'png' ||
    image.id.endsWith('.jpg') ||
    image.id.endsWith('.png');

  let thumbnailUrl =
    image.thumbnail || image.location || (isImageFile ? `https://api.jwstapi.com/thumb/${image.id}` : '');

  // Upgrade HTTP to HTTPS to avoid mixed content errors
  if (thumbnailUrl && thumbnailUrl.startsWith('http://')) {
    thumbnailUrl = thumbnailUrl.replace('http://', 'https://');
  }

  const showImage = Boolean(thumbnailUrl) && !hasError;

  return (
    <Card className="overflow-hidden">
      <div className="relative aspect-4/3 bg-muted">
        {showImage ? (
          <Image
            src={thumbnailUrl as string}
            alt={baseTitle}
            fill
            className="object-cover"
            unoptimized
            onError={() => setHasError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <ImageIcon className="h-10 w-10 opacity-50" />
          </div>
        )}
      </div>

      <CardContent className="space-y-3 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <p className="font-medium truncate">{baseTitle}</p>
            {instruments ? <p className="text-sm text-muted-foreground truncate">{instruments}</p> : null}
          </div>
          {suffix ? (
            <Badge variant="secondary" className="shrink-0">
              {suffix}
            </Badge>
          ) : null}
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
          {suffix ? (
            <div className="space-y-0.5">
              <p className="text-foreground font-semibold text-xs">Суффикс</p>
              <p className="truncate uppercase">{suffix}</p>
            </div>
          ) : null}
          {program ? (
            <div className="space-y-0.5">
              <p className="text-foreground font-semibold text-xs">Программа</p>
              <p className="truncate">{program}</p>
            </div>
          ) : null}
          {instruments ? (
            <div className="col-span-2 space-y-0.5">
              <p className="text-foreground font-semibold text-xs">Инструменты</p>
              <p className="truncate">{instruments}</p>
            </div>
          ) : null}
          {image.file_type ? (
            <div className="space-y-0.5">
              <p className="text-foreground font-semibold text-xs">Тип файла</p>
              <p className="uppercase">{image.file_type}</p>
            </div>
          ) : null}
          {description ? (
            <div className="col-span-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
              {description}
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export { JWSTGallery as default };
