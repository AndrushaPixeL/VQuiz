import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload, Mic, Bot, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Answer {
  id: string;
  text: string;
  isCorrect: boolean;
}

interface Question {
  id: string;
  type: 'multiple_choice' | 'true_false' | 'image_question' | 'audio_question';
  text: string;
  image?: string;
  audio?: string;
  answers: Answer[];
  timeLimit: number;
}

interface QuestionEditorProps {
  question: Question;
  onChange: (question: Question) => void;
  onDelete?: () => void;
  className?: string;
}

const answerColors = [
  { bg: "bg-red-100", text: "text-red-600", label: "A" },
  { bg: "bg-blue-100", text: "text-blue-600", label: "B" },
  { bg: "bg-green-100", text: "text-green-600", label: "C" },
  { bg: "bg-yellow-100", text: "text-yellow-600", label: "D" },
];

export function QuestionEditor({ question, onChange, onDelete, className }: QuestionEditorProps) {
  const updateQuestion = (updates: Partial<Question>) => {
    onChange({ ...question, ...updates });
  };

  const updateAnswer = (index: number, updates: Partial<Answer>) => {
    const newAnswers = [...question.answers];
    newAnswers[index] = { ...newAnswers[index], ...updates };
    updateQuestion({ answers: newAnswers });
  };

  const setCorrectAnswer = (index: number) => {
    const newAnswers = question.answers.map((answer, i) => ({
      ...answer,
      isCorrect: i === index
    }));
    updateQuestion({ answers: newAnswers });
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Question Content */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Содержание вопроса</CardTitle>
          {onDelete && (
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="question-text">Текст вопроса</Label>
            <Textarea
              id="question-text"
              value={question.text}
              onChange={(e) => updateQuestion({ text: e.target.value })}
              placeholder="Введите ваш вопрос здесь..."
              rows={3}
            />
          </div>

          {/* Image Upload */}
          <div>
            <Label>Фон/Изображение</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">Перетащите изображение или нажмите для выбора</p>
              <p className="text-sm text-gray-500 mt-1">JPG, PNG до 10MB</p>
            </div>
          </div>

          {/* Audio Upload */}
          <div>
            <Label>Аудио для вопроса</Label>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Mic className="w-4 h-4 mr-2" />
                Загрузить аудио
              </Button>
              <Button variant="outline" size="sm">
                <Bot className="w-4 h-4 mr-2" />
                Озвучить ИИ
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Answer Options */}
      <Card>
        <CardHeader>
          <CardTitle>Варианты ответов</CardTitle>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={question.answers.findIndex(a => a.isCorrect).toString()}
            onValueChange={(value) => setCorrectAnswer(parseInt(value))}
          >
            <div className="space-y-3">
              {question.answers.map((answer, index) => {
                const color = answerColors[index % answerColors.length];
                return (
                  <div key={answer.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", color.bg)}>
                      <span className={cn("font-medium", color.text)}>{color.label}</span>
                    </div>
                    <Input
                      placeholder={`Вариант ответа ${color.label}`}
                      value={answer.text}
                      onChange={(e) => updateAnswer(index, { text: e.target.value })}
                      className="flex-1"
                    />
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={index.toString()} id={`answer-${index}`} />
                      <Label htmlFor={`answer-${index}`} className="text-sm text-gray-600">
                        Правильный
                      </Label>
                    </div>
                  </div>
                );
              })}
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </div>
  );
}
