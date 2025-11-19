import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Button } from '@/components/ui/button';

export function MarkdownEditor({ value, onChange, placeholder }) {
  const [isPreview, setIsPreview] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex gap-2 mb-2">
        <Button
          type="button"
          size="sm"
          variant={!isPreview ? 'default' : 'outline'}
          onClick={() => setIsPreview(false)}
        >
          Edit
        </Button>
        <Button
          type="button"
          size="sm"
          variant={isPreview ? 'default' : 'outline'}
          onClick={() => setIsPreview(true)}
        >
          Preview
        </Button>
      </div>
      
      {!isPreview ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full min-h-[120px] px-3 py-2 bg-background border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-transparent resize-y font-mono text-sm"
        />
      ) : (
        <div className="w-full min-h-[120px] px-3 py-2 bg-muted border border-input rounded-md prose prose-sm dark:prose-invert max-w-none">
          {value ? (
            <ReactMarkdown>{value}</ReactMarkdown>
          ) : (
            <p className="text-muted-foreground italic">No description</p>
          )}
        </div>
      )}
    </div>
  );
}
