import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Play, Edit, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizCardProps {
  quiz: {
    id: number;
    title: string;
    description?: string;
    questions: any[];
    isPublic: boolean;
    createdAt: Date;
  };
  onStart: (quizId: number) => void;
  onEdit: (quizId: number) => void;
  className?: string;
}

const gradients = [
  "gradient-math",
  "gradient-history", 
  "gradient-geography",
  "gradient-primary"
];

export function QuizCard({ quiz, onStart, onEdit, className }: QuizCardProps) {
  const gradient = gradients[quiz.id % gradients.length];
  
  return (
    <Card className={cn("overflow-hidden hover:shadow-md transition-shadow", className)}>
      <div className={cn("h-48 relative", gradient)}>
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="font-bold text-lg">{quiz.title}</h3>
          <p className="text-sm text-white/80">{quiz.questions.length} вопросов</p>
        </div>
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="bg-white/20 backdrop-blur-sm text-white">
            {quiz.isPublic ? "Публичный" : "Приватный"}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Users className="w-4 h-4 mr-1" />
            <span>0 игр</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={() => onStart(quiz.id)} className="flex-1">
            <Play className="w-4 h-4 mr-2" />
            Играть
          </Button>
          <Button variant="outline" onClick={() => onEdit(quiz.id)} className="flex-1">
            <Edit className="w-4 h-4 mr-2" />
            Изменить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
