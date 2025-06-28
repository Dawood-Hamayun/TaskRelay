// components/TagSelector.tsx - Updated with better colors
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tag, Plus, Loader2 } from 'lucide-react';
import { useTags } from '@/hooks/useTags';
import { useTheme } from 'next-themes';

const TAG_COLORS = [
  { 
    value: 'blue', 
    label: 'Blue', 
    lightClass: 'bg-blue-600 text-white border-blue-600',
    darkClass: 'bg-blue-500 text-white border-blue-500',
    previewClass: 'bg-blue-500'
  },
  { 
    value: 'purple', 
    label: 'Purple', 
    lightClass: 'bg-purple-600 text-white border-purple-600',
    darkClass: 'bg-purple-500 text-white border-purple-500',
    previewClass: 'bg-purple-500'
  },
  { 
    value: 'emerald', 
    label: 'Green', 
    lightClass: 'bg-emerald-600 text-white border-emerald-600',
    darkClass: 'bg-emerald-500 text-white border-emerald-500',
    previewClass: 'bg-emerald-500'
  },
  { 
    value: 'red', 
    label: 'Red', 
    lightClass: 'bg-red-600 text-white border-red-600',
    darkClass: 'bg-red-500 text-white border-red-500',
    previewClass: 'bg-red-500'
  },
  { 
    value: 'amber', 
    label: 'Yellow', 
    lightClass: 'bg-amber-600 text-white border-amber-600',
    darkClass: 'bg-amber-500 text-white border-amber-500',
    previewClass: 'bg-amber-500'
  },
  { 
    value: 'orange', 
    label: 'Orange', 
    lightClass: 'bg-orange-600 text-white border-orange-600',
    darkClass: 'bg-orange-500 text-white border-orange-500',
    previewClass: 'bg-orange-500'
  },
];

interface TagSelectorProps {
  projectId: string;
  selectedTags?: string[];
  onTagsChange?: (tagIds: string[]) => void;
}

export function TagSelector({ projectId, selectedTags = [], onTagsChange }: TagSelectorProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('blue');
  const { theme } = useTheme();
  
  const { tags, createTag, isCreating } = useTags(projectId);

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;
    
    try {
      await createTag({ name: newTagName.trim(), color: newTagColor });
      setNewTagName('');
      setShowCreate(false);
    } catch (error) {
      console.error('Failed to create tag:', error);
    }
  };

  const toggleTag = (tagId: string) => {
    const newTags = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId];
    onTagsChange?.(newTags);
  };

  const getTagClass = (color: string, isSelected: boolean = true) => {
    const colorConfig = TAG_COLORS.find(c => c.value === color);
    if (!colorConfig) return TAG_COLORS[0].lightClass;
    
    const isDark = theme === 'dark';
    const baseClass = isDark ? colorConfig.darkClass : colorConfig.lightClass;
    
    if (!isSelected) {
      return isDark 
        ? 'bg-gray-800 text-gray-400 border-gray-700 opacity-60 hover:opacity-80' 
        : 'bg-gray-200 text-gray-500 border-gray-300 opacity-60 hover:opacity-80';
    }
    
    return baseClass;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCreateTag();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-card-foreground">Tags</label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setShowCreate(!showCreate)}
          className="h-6 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          New
        </Button>
      </div>

      {/* Create new tag */}
      {showCreate && (
        <div className="flex gap-2 p-3 bg-muted/50 rounded-lg border">
          <Input
            placeholder="Tag name"
            value={newTagName}
            onChange={(e) => setNewTagName(e.target.value)}
            onKeyPress={handleKeyPress}
            className="h-8 text-xs flex-1"
            autoFocus
          />
          <Select value={newTagColor} onValueChange={setNewTagColor}>
            <SelectTrigger className="w-24 h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TAG_COLORS.map(color => (
                <SelectItem key={color.value} value={color.value}>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${color.previewClass}`} />
                    <span className="text-xs">{color.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            onClick={handleCreateTag} 
            disabled={!newTagName.trim() || isCreating} 
            size="sm" 
            className="h-8 px-3"
          >
            {isCreating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
          </Button>
        </div>
      )}

      {/* Available tags */}
      <div className="flex flex-wrap gap-2">
        {tags.length === 0 ? (
          <p className="text-sm text-muted-foreground">No tags created yet</p>
        ) : (
          tags.map(tag => {
            const isSelected = selectedTags.includes(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.id)}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 hover:scale-105 ${getTagClass(tag.color, isSelected)}`}
              >
                <Tag className="h-3 w-3 mr-1" />
                {tag.name}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}