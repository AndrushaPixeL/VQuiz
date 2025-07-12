import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Save, Plus, Trash2, Eye, Star, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  elements: any[];
  backgroundStyle: any;
  createdAt: Date;
  isPublic: boolean;
  usageCount: number;
  thumbnail?: string;
}

interface TemplateManagerProps {
  onSelectTemplate: (template: Template) => void;
  onSaveTemplate: (template: Omit<Template, 'id' | 'createdAt' | 'usageCount'>) => void;
  className?: string;
}

export function TemplateManager({ onSelectTemplate, onSaveTemplate, className }: TemplateManagerProps) {
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: "1",
      name: "Базовый множественный выбор",
      description: "Простой шаблон для вопросов с множественным выбором",
      category: "basic",
      elements: [],
      backgroundStyle: { type: 'color', value: '#6366f1' },
      createdAt: new Date(),
      isPublic: true,
      usageCount: 45,
    },
    {
      id: "2",
      name: "Научная викторина",
      description: "Шаблон для научных вопросов с формулами и диаграммами",
      category: "science",
      elements: [],
      backgroundStyle: { type: 'color', value: '#059669' },
      createdAt: new Date(),
      isPublic: true,
      usageCount: 23,
    },
    {
      id: "3",
      name: "Визуальная игра",
      description: "Шаблон с акцентом на изображения и интерактивные элементы",
      category: "visual",
      elements: [],
      backgroundStyle: { type: 'color', value: '#dc2626' },
      createdAt: new Date(),
      isPublic: true,
      usageCount: 67,
    },
  ]);

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    description: '',
    category: 'custom',
    isPublic: false,
  });

  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = [
    { id: 'all', name: 'Все', count: templates.length },
    { id: 'basic', name: 'Базовые', count: templates.filter(t => t.category === 'basic').length },
    { id: 'science', name: 'Наука', count: templates.filter(t => t.category === 'science').length },
    { id: 'visual', name: 'Визуальные', count: templates.filter(t => t.category === 'visual').length },
    { id: 'custom', name: 'Мои', count: templates.filter(t => t.category === 'custom').length },
  ];

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const handleCreateTemplate = () => {
    const template: Omit<Template, 'id' | 'createdAt' | 'usageCount'> = {
      ...newTemplate,
      elements: [],
      backgroundStyle: { type: 'color', value: '#6366f1' },
      isPublic: false,
    };

    onSaveTemplate(template);
    
    // Add to local templates
    const newTemplateWithId: Template = {
      ...template,
      id: Date.now().toString(),
      createdAt: new Date(),
      usageCount: 0,
    };
    
    setTemplates([...templates, newTemplateWithId]);
    setShowCreateDialog(false);
    setNewTemplate({ name: '', description: '', category: 'custom', isPublic: false });
  };

  const handleDeleteTemplate = (id: string) => {
    setTemplates(templates.filter(t => t.id !== id));
  };

  const handleDuplicateTemplate = (template: Template) => {
    const duplicatedTemplate: Template = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (копия)`,
      createdAt: new Date(),
      usageCount: 0,
      category: 'custom',
      isPublic: false,
    };

    setTemplates([...templates, duplicatedTemplate]);
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Шаблоны вопросов</h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Создать шаблон
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Создать новый шаблон</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="template-name">Название шаблона</Label>
                <Input
                  id="template-name"
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                  placeholder="Введите название шаблона"
                />
              </div>
              <div>
                <Label htmlFor="template-description">Описание</Label>
                <Textarea
                  id="template-description"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                  placeholder="Опишите ваш шаблон"
                  rows={3}
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="template-public"
                  checked={newTemplate.isPublic}
                  onChange={(e) => setNewTemplate({ ...newTemplate, isPublic: e.target.checked })}
                />
                <Label htmlFor="template-public">Сделать публичным</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Отмена
                </Button>
                <Button onClick={handleCreateTemplate} disabled={!newTemplate.name.trim()}>
                  Создать
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Filter */}
      <div className="flex space-x-2 overflow-x-auto">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.id)}
            className="flex-shrink-0"
          >
            {category.name}
            <Badge variant="secondary" className="ml-2">
              {category.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                </div>
                <div className="flex items-center space-x-1">
                  {template.isPublic && (
                    <Badge variant="outline" className="text-xs">
                      Публичный
                    </Badge>
                  )}
                  <div className="flex items-center text-xs text-gray-500">
                    <Star className="w-3 h-3 mr-1" />
                    {template.usageCount}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Template Preview */}
                <div 
                  className="h-24 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center"
                  style={{ backgroundColor: template.backgroundStyle.value + '20' }}
                >
                  <Eye className="w-8 h-8 text-gray-400" />
                </div>
                
                {/* Action Buttons */}
                <div className="flex space-x-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => onSelectTemplate(template)}
                    className="flex-1"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Использовать
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicateTemplate(template)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  {template.category === 'custom' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <Save className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {selectedCategory === 'custom' ? 'Нет личных шаблонов' : 'Нет шаблонов в категории'}
          </h3>
          <p className="text-gray-600 mb-4">
            {selectedCategory === 'custom' 
              ? 'Создайте свой первый шаблон для быстрого создания вопросов'
              : 'Попробуйте выбрать другую категорию'
            }
          </p>
          {selectedCategory === 'custom' && (
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Создать шаблон
            </Button>
          )}
        </div>
      )}
    </div>
  );
}