'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useCMS } from '@/hooks/use-cms';
import { FileText } from 'lucide-react';

interface CMSBlockProps {
  slug: string;
  showTitle?: boolean;
}

export function CMSBlock({ slug, showTitle = true }: CMSBlockProps) {
  const { page, loading, error, refetch } = useCMS();

  useEffect(() => {
    refetch(slug);
  }, [refetch, slug]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-20" />
        </CardContent>
      </Card>
    );
  }

  if (error || !page) {
    return null; // Silently fail for CMS blocks
  }

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {page.title}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div
          className="prose prose-sm dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: page.html_body }}
        />
      </CardContent>
    </Card>
  );
}

export { CMSBlock as default };
