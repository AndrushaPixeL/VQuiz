import { useState } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  ArrowRight, 
  Settings, 
  Users, 
  Mic, 
  Layout,
  Sparkles,
  Wand2
} from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const quizSettingsSchema = z.object({
  title: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
  template: z.string().optional(),
  minPlayers: z.number().min(1, 'Минимум 1 игрок').max(100),
  maxPlayers: z.number().min(1, 'Минимум 1 игрок').max(100),
  timeLimit: z.number().min(5, 'Минимум 5 секунд').max(300, 'Максимум 300 секунд'),
  useAudioNarration: z.boolean(),
  aiVoice: z.string().optional(),
  isPublic: z.boolean(),
  questionTemplate: z.string().optional(),
});

type QuizSettings = z.infer<typeof quizSettingsSchema>;

const QUIZ_TEMPLATES = [
  { 
    id: 'blank', 
    name: 'Пустой квиз', 
    description: 'Начните с чистого листа',
    icon: '📝',
    color: 'bg-gray-100 text-gray-800'
  },
  { 
    id: 'educational', 
    name: 'Образовательный', 
    description: 'Шаблон для обучающих квизов',
    icon: '🎓',
    color: 'bg-blue-100 text-blue-800'
  },
  { 
    id: 'trivia', 
    name: 'Викторина', 
    description: 'Общие знания и развлечения',
    icon: '🧠',
    color: 'bg-purple-100 text-purple-800'
  },
  { 
    id: 'corporate', 
    name: 'Корпоративный', 
    description: 'Для тренингов и командных игр',
    icon: '💼',
    color: 'bg-green-100 text-green-800'
  },
  { 
    id: 'kids', 
    name: 'Детский', 
    description: 'Веселые вопросы для детей',
    icon: '🎈',
    color: 'bg-yellow-100 text-yellow-800'
  },
];

const AI_VOICES = [
  { id: 'alloy', name: 'Alloy', description: 'Нейтральный голос' },
  { id: 'echo', name: 'Echo', description: 'Мужской голос' },
  { id: 'fable', name: 'Fable', description: 'Женский голос' },
  { id: 'onyx', name: 'Onyx', description: 'Глубокий мужской голос' },
  { id: 'nova', name: 'Nova', description: 'Молодой женский голос' },
  { id: 'shimmer', name: 'Shimmer', description: 'Мягкий женский голос' },
];

export default function QuizSettings() {
  const [, setLocation] = useLocation();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('blank');

  const form = useForm<QuizSettings>({
    resolver: zodResolver(quizSettingsSchema),
    defaultValues: {
      title: '',
      description: '',
      template: 'blank',
      minPlayers: 2,
      maxPlayers: 20,
      timeLimit: 30,
      useAudioNarration: false,
      aiVoice: 'alloy',
      isPublic: false,
      questionTemplate: 'classic',
    },
  });

  const onSubmit = async (data: QuizSettings) => {
    // Сохраняем настройки в localStorage для передачи в конструктор
    localStorage.setItem('quizSettings', JSON.stringify(data));
    setLocation('/constructor');
  };

  const selectedTemplateData = QUIZ_TEMPLATES.find(t => t.id === selectedTemplate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setLocation('/')}
              variant="ghost"
              size="sm"
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Назад
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Настройки квиза
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Настройте основные параметры перед созданием квиза
              </p>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Основная информация
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Название квиза</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Введите название квиза"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Описание (необязательно)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Краткое описание квиза"
                          rows={3}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Template Selection */}
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layout className="w-5 h-5" />
                  Выберите шаблон
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {QUIZ_TEMPLATES.map((template) => (
                    <div
                      key={template.id}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        selectedTemplate === template.id
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => {
                        setSelectedTemplate(template.id);
                        form.setValue('template', template.id);
                      }}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">{template.icon}</div>
                        <h3 className="font-semibold text-sm mb-1">{template.name}</h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {template.description}
                        </p>
                        <Badge className={`mt-2 ${template.color}`}>
                          {template.name}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Game Settings */}
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Настройки игры
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="minPlayers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Минимум игроков</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="100"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxPlayers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Максимум игроков</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="100"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="timeLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Время на вопрос (сек)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="5"
                            max="300"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="isPublic"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Публичный квиз</FormLabel>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Другие пользователи смогут находить и играть в ваш квиз
                        </p>
                      </div>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* AI Settings */}
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mic className="w-5 h-5" />
                  ИИ озвучка (OpenAI)
                  <Badge variant="secondary" className="ml-2">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Премиум
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="useAudioNarration"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Включить ИИ озвучку</FormLabel>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Автоматическое озвучивание вопросов с помощью OpenAI TTS
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch('useAudioNarration') && (
                  <FormField
                    control={form.control}
                    name="aiVoice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Голос диктора</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите голос" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {AI_VOICES.map((voice) => (
                              <SelectItem key={voice.id} value={voice.id}>
                                <div className="flex flex-col">
                                  <span className="font-medium">{voice.name}</span>
                                  <span className="text-xs text-gray-500">{voice.description}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex justify-between items-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation('/')}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Отмена
              </Button>
              
              <Button type="submit" className="gap-2">
                Перейти к редактору
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}