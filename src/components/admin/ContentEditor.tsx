'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { WYSIWYGEditor } from '@/components/ui/wysiwyg-editor';
import { Save, Edit, Eye, Trash2 } from 'lucide-react';

interface ContentBlock {
  id: string;
  block_key: string;
  block_type: 'text' | 'richtext' | 'json' | 'image';
  content: any;
  display_order: number;
  is_visible: boolean;
}

interface ContentEditorProps {
  pageSlug: string;
  onSave?: () => void;
}

export function ContentEditor({ pageSlug, onSave }: ContentEditorProps) {
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    loadBlocks();
  }, [pageSlug]);

  const loadBlocks = async () => {
    try {
      const response = await fetch(`/api/cms/content?page=${pageSlug}`);
      const data = await response.json();
      setBlocks(data.blocks || []);
    } catch (error) {
      console.error('Failed to load blocks:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBlock = async (blockId: string, updates: Partial<ContentBlock>) => {
    try {
      setSaveStatus('saving');
      setErrorMessage('');
      
      const response = await fetch(`/api/cms/content/${blockId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save changes');
      }

      // Reload blocks to show updated content
      await loadBlocks();
      setEditingBlock(null);
      setSaveStatus('success');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveStatus('idle'), 3000);
      
      onSave?.();
    } catch (error) {
      console.error('Failed to update block:', error);
      setSaveStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save changes');
      
      // Clear error after 5 seconds
      setTimeout(() => {
        setSaveStatus('idle');
        setErrorMessage('');
      }, 5000);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading content...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Save Status Messages */}
      {saveStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <span className="text-lg">✅</span>
          <span className="font-medium">Changes saved successfully!</span>
        </div>
      )}
      
      {saveStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="text-lg">❌</span>
            <span className="font-medium">Failed to save changes</span>
          </div>
          {errorMessage && (
            <p className="text-sm mt-1 ml-7">{errorMessage}</p>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Editor</h2>
          <p className="text-gray-600 mt-1">Editing: {pageSlug}</p>
        </div>
      </div>

      {/* Content Blocks */}
      <div className="space-y-4">
        {blocks.map((block) => (
          <div key={block.id} className="bg-white rounded-lg border p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">
                  {block.block_key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Type: {block.block_type} • Order: {block.display_order}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingBlock(editingBlock === block.id ? null : block.id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {editingBlock === block.id ? (
              <BlockEditor
                block={block}
                onSave={(updates) => updateBlock(block.id, updates)}
                onCancel={() => setEditingBlock(null)}
                isSaving={saveStatus === 'saving'}
              />
            ) : (
              <BlockPreview block={block} />
            )}
          </div>
        ))}
      </div>

      {blocks.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border">
          <p className="text-gray-500">No content blocks found for this page.</p>
          <Button className="mt-4" onClick={() => {}}>
            Add First Block
          </Button>
        </div>
      )}
    </div>
  );
}

function BlockEditor({
  block,
  onSave,
  onCancel,
  isSaving
}: {
  block: ContentBlock;
  onSave: (updates: Partial<ContentBlock>) => void;
  onCancel: () => void;
  isSaving?: boolean;
}) {
  const [content, setContent] = useState(block.content);
  const [isVisible, setIsVisible] = useState(block.is_visible);

  const handleSave = () => {
    onSave({ content, is_visible: isVisible });
  };

  return (
    <div className="space-y-4 border-t pt-4">
      {block.block_type === 'text' && (
        <div>
          <Label>Content</Label>
          <Input
            value={typeof content === 'string' ? content : content.text || ''}
            onChange={(e) => setContent({ text: e.target.value })}
            className="mt-2"
          />
        </div>
      )}

      {block.block_type === 'richtext' && (
        <div>
          <Label>Content (WYSIWYG Editor)</Label>
          <WYSIWYGEditor
            content={typeof content === 'string' ? content : content.html || ''}
            onChange={(html) => setContent({ html })}
            className="mt-2"
          />
          <p className="text-xs text-gray-500 mt-1">
            Visual editor with formatting toolbar. HTML is generated automatically.
          </p>
        </div>
      )}

      {block.block_type === 'json' && (
        <div>
          <Label>JSON Content</Label>
          <Textarea
            value={JSON.stringify(content, null, 2)}
            onChange={(e) => {
              try {
                setContent(JSON.parse(e.target.value));
              } catch (err) {
                // Invalid JSON, don't update
              }
            }}
            rows={12}
            className="mt-2 font-mono text-xs"
          />
          <p className="text-xs text-gray-500 mt-1">Must be valid JSON</p>
        </div>
      )}

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isVisible}
            onChange={(e) => setIsVisible(e.target.checked)}
            className="rounded"
          />
          <span className="text-sm">Visible on site</span>
        </label>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
      </div>
    </div>
  );
}

function BlockPreview({ block }: { block: ContentBlock }) {
  const renderContent = () => {
    if (block.block_type === 'text') {
      return (
        <p className="text-gray-700">
          {typeof block.content === 'string' ? block.content : block.content?.text || '(empty)'}
        </p>
      );
    }

    if (block.block_type === 'richtext') {
      return (
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{
            __html: typeof block.content === 'string' ? block.content : block.content?.html || ''
          }}
        />
      );
    }

    if (block.block_type === 'json') {
      return (
        <pre className="bg-gray-50 p-4 rounded border text-xs overflow-auto">
          {JSON.stringify(block.content, null, 2)}
        </pre>
      );
    }

    return <p className="text-gray-500 italic">No preview available</p>;
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      {renderContent()}
      {!block.is_visible && (
        <div className="mt-2 text-xs text-orange-600">
          ⚠️ This block is hidden from the public site
        </div>
      )}
    </div>
  );
}

