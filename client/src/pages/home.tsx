import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QuizCard } from "@/components/quiz-card";
import { QRCodeModal } from "@/components/qr-code-modal";
import { Brain, Plus, QrCode, Trophy, Users, Play, ArrowRight } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Home() {
  const [showJoinModal, setShowJoinModal] = useState(false);
  const { toast } = useToast();

  const { data: quizzes = [], isLoading } = useQuery({
    queryKey: ['/api/quizzes'],
  });

  const createGameMutation = useMutation({
    mutationFn: async (quizId: number) => {
      const response = await apiRequest('POST', '/api/games', { quizId });
      return response.json();
    },
    onSuccess: (data) => {
      // Redirect to host page
      window.location.href = `/host/${data.gameCode}`;
    },
    onError: () => {
      toast({
        title: "Ошибка",
        description: "Не удалось создать игру",
        variant: "destructive",
      });
    },
  });

  const handleStartQuiz = (quizId: number) => {
    createGameMutation.mutate(quizId);
  };

  const handleJoinGame = (gameCode: string) => {
    window.location.href = `/play/${gameCode}`;
    setShowJoinModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <Brain className="text-primary w-8 h-8 mr-2" />
                <span className="text-xl font-bold text-gray-900">QuizMaster</span>
              </div>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <Link href="/" className="text-gray-900 hover:text-primary transition-colors font-medium">
                Главная
              </Link>
              <Link href="/quizzes" className="text-gray-500 hover:text-primary transition-colors font-medium">
                Мои квизы
              </Link>
            </nav>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-white text-sm"></i>
                </div>
                <span className="text-sm font-medium text-gray-900 hidden sm:block">Александр</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="gradient-primary rounded-2xl p-8 text-white relative overflow-hidden">
            <div className="relative z-10">
              <h1 className="text-4xl font-bold mb-4">Создавайте увлекательные квизы</h1>
              <p className="text-xl mb-6 text-white/90">Конструктор квизов с возможностью игры в реальном времени</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  asChild 
                  className="bg-white text-primary hover:bg-gray-100"
                >
                  <Link href="/constructor">
                    <Plus className="w-5 h-5 mr-2" />
                    Создать новый квиз
                  </Link>
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowJoinModal(true)}
                  className="border-white text-white hover:bg-white hover:text-primary"
                >
                  <QrCode className="w-5 h-5 mr-2" />
                  Присоединиться к игре
                </Button>
              </div>
            </div>
            <div className="absolute top-4 right-4 text-white/20">
              <Brain className="w-32 h-32" />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Trophy className="text-primary w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Всего квизов</p>
                  <p className="text-2xl font-bold text-gray-900">{quizzes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="bg-green-500/10 p-3 rounded-lg">
                  <Users className="text-green-500 w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Игроков онлайн</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center">
                <div className="bg-yellow-500/10 p-3 rounded-lg">
                  <Play className="text-yellow-500 w-6 h-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Активных игр</p>
                  <p className="text-2xl font-bold text-gray-900">0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Quizzes */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Мои квизы</h2>
            <Button variant="ghost" asChild>
              <Link href="/quizzes">
                Смотреть все
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : quizzes.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Нет квизов</h3>
              <p className="text-gray-600 mb-4">Создайте свой первый квиз прямо сейчас!</p>
              <Button asChild>
                <Link href="/constructor">
                  <Plus className="w-5 h-5 mr-2" />
                  Создать квиз
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quizzes.map((quiz: any) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  onStart={handleStartQuiz}
                  onEdit={(id) => window.location.href = `/constructor/${id}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quiz Templates */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Шаблоны квизов</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Множественный выбор", icon: "fas fa-list-ul", color: "bg-blue-100", iconColor: "text-blue-600" },
              { title: "Правда/Ложь", icon: "fas fa-check-circle", color: "bg-green-100", iconColor: "text-green-600" },
              { title: "Квиз с изображениями", icon: "fas fa-image", color: "bg-purple-100", iconColor: "text-purple-600" },
              { title: "Аудио квиз", icon: "fas fa-volume-up", color: "bg-orange-100", iconColor: "text-orange-600" },
            ].map((template) => (
              <Card key={template.title} className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 ${template.color} rounded-lg flex items-center justify-center mb-4`}>
                    <i className={`${template.icon} ${template.iconColor} text-xl`}></i>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{template.title}</h3>
                  <p className="text-sm text-gray-600">Создать квиз с этим шаблоном</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <Button
        asChild
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg hover:scale-110 transition-transform"
      >
        <Link href="/constructor">
          <Plus className="w-6 h-6" />
        </Link>
      </Button>

      <QRCodeModal
        open={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoin={handleJoinGame}
      />
    </div>
  );
}
