import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  Monitor, 
  BarChart3, 
  GripVertical,
  Edit2,
  Trash2,
  Copy
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ContentItem {
  id: string;
  type: 'question' | 'splash' | 'results';
  title: string;
  content?: any;
  timeLimit?: number;
}

interface ContentListProps {
  items: ContentItem[];
  onReorder: (items: ContentItem[]) => void;
  onEdit: (item: ContentItem) => void;
  onDelete: (id: string) => void;
  onDuplicate: (item: ContentItem) => void;
  className?: string;
}

function SortableItem({ 
  item, 
  onEdit, 
  onDelete, 
  onDuplicate 
}: { 
  item: ContentItem;
  onEdit: (item: ContentItem) => void;
  onDelete: (id: string) => void;
  onDuplicate: (item: ContentItem) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getIcon = () => {
    switch (item.type) {
      case 'question':
        return <HelpCircle className="w-5 h-5 text-blue-600" />;
      case 'splash':
        return <Monitor className="w-5 h-5 text-green-600" />;
      case 'results':
        return <BarChart3 className="w-5 h-5 text-purple-600" />;
    }
  };

  const getTypeLabel = () => {
    switch (item.type) {
      case 'question':
        return 'Вопрос';
      case 'splash':
        return 'Заставка';
      case 'results':
        return 'Результаты';
    }
  };

  const getBadgeColor = () => {
    switch (item.type) {
      case 'question':
        return 'bg-blue-100 text-blue-800';
      case 'splash':
        return 'bg-green-100 text-green-800';
      case 'results':
        return 'bg-purple-100 text-purple-800';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "touch-none",
        isDragging && "opacity-50"
      )}
      {...attributes}
    >
      <Card className="mb-3 hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1">
              <div
                {...listeners}
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
              >
                <GripVertical className="w-4 h-4 text-gray-400" />
              </div>
              
              {getIcon()}
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-sm truncate">{item.title}</h3>
                  <Badge className={cn("text-xs", getBadgeColor())}>
                    {getTypeLabel()}
                  </Badge>
                  {item.timeLimit && (
                    <Badge variant="outline" className="text-xs">
                      {item.timeLimit}с
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onEdit(item)}
                className="h-8 w-8 p-0"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDuplicate(item)}
                className="h-8 w-8 p-0"
              >
                <Copy className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(item.id)}
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function UnifiedContentList({
  items,
  onReorder,
  onEdit,
  onDelete,
  onDuplicate,
  className
}: ContentListProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over?.id);

      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  }

  return (
    <div className={className}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableItem
              key={item.id}
              item={item}
              onEdit={onEdit}
              onDelete={onDelete}
              onDuplicate={onDuplicate}
            />
          ))}
        </SortableContext>
      </DndContext>
      
      {items.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <HelpCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <p>Нет контента</p>
          <p className="text-sm">Добавьте вопросы, заставки или экраны результатов</p>
        </div>
      )}
    </div>
  );
}