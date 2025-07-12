import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlayerList } from "@/components/player-list";
import { useWebSocket } from "@/hooks/use-websocket";
import { X, Play, Pause, ArrowRight, Users, Clock, Hash, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

export default function GameHost() {
  const { gameCode } = useParams<{ gameCode: string }>();
  const [, setLocation] = useLocation();
  const { gameState, isConnected, startGame, nextQuestion } = useWebSocket();
  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {
    if (!gameCode) {
      setLocation('/');
      return;
    }

    // Check if game exists
    fetch(`/api/games/${gameCode}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Game not found');
        }
        return res.json();
      })
      .catch(() => {
        setLocation('/');
      });
  }, [gameCode, setLocation]);

  const handleStartGame = () => {
    if (gameState.players.length < 2) {
      alert('Нужно минимум 2 игрока для начала игры');
      return;
    }
    startGame();
  };

  const handleNextQuestion = () => {
    nextQuestion();
  };

  const handleExitGame = () => {
    setLocation('/');
  };

  if (!gameCode || !isConnected) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Подключение к игре...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = gameState.currentQuestionData;
  const isWaiting = gameState.status === 'waiting';
  const isInProgress = gameState.status === 'in_progress';
  const isFinished = gameState.status === 'finished';

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Host Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={handleExitGame}>
              <X className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900">
              {gameState.quiz?.title || 'Загрузка...'}
            </h1>
          </div>
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Код игры</p>
              <p className="text-lg font-bold text-primary">{gameCode}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Вопрос</p>
              <p className="text-lg font-semibold text-gray-900">
                {gameState.currentQuestion} из {gameState.totalQuestions}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Игроки</p>
              <p className="text-lg font-semibold text-gray-900">{gameState.players.length}</p>
            </div>
            {isInProgress && (
              <div className="text-center">
                <p className="text-sm text-gray-600">Время</p>
                <p className="text-lg font-semibold text-orange-600">{gameState.timeLeft}с</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Main Game Area */}
      <div className="flex-1 flex">
        {/* Question Display */}
        <div className="flex-1 gradient-primary relative overflow-hidden">
          <div className="absolute inset-0 bg-black bg-opacity-30"></div>
          <div className="relative z-10 h-full flex flex-col justify-center items-center text-white p-8">
            <div className="text-center max-w-4xl w-full">
              {isWaiting && (
                <>
                  <h2 className="text-4xl font-bold mb-8">Ожидание игроков</h2>
                  <div className="mb-8">
                    <QrCode className="w-24 h-24 mx-auto mb-4 text-white/80" />
                    <p className="text-xl mb-2">Код игры: <span className="font-bold">{gameCode}</span></p>
                    <p className="text-white/80">Игроки могут присоединиться, введя этот код</p>
                  </div>
                  <div className="flex justify-center space-x-4">
                    <Button
                      onClick={handleStartGame}
                      disabled={gameState.players.length < 2}
                      className="bg-white text-primary hover:bg-gray-100"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Начать игру
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowQRCode(!showQRCode)}
                      className="border-white text-white hover:bg-white hover:text-primary"
                    >
                      <QrCode className="w-5 h-5 mr-2" />
                      QR-код
                    </Button>
                  </div>
                </>
              )}

              {isInProgress && currentQuestion && (
                <>
                  <h2 className="text-4xl font-bold mb-8">{currentQuestion.text}</h2>
                  
                  {/* Answer Options Display */}
                  <div className="grid grid-cols-2 gap-6 mt-12">
                    {currentQuestion.answers.map((answer: any, index: number) => {
                      const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500'];
                      const labels = ['A', 'B', 'C', 'D'];
                      return (
                        <div
                          key={answer.id}
                          className={cn(
                            "bg-opacity-90 rounded-xl p-6 text-center",
                            colors[index % colors.length]
                          )}
                        >
                          <div className="text-2xl font-bold mb-2">{labels[index]}</div>
                          <div className="text-lg">{answer.text}</div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Timer Circle */}
                  <div className="mt-12">
                    <div className="w-24 h-24 mx-auto bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                      <span className="text-3xl font-bold">{gameState.timeLeft}</span>
                    </div>
                  </div>
                </>
              )}

              {isFinished && (
                <>
                  <h2 className="text-4xl font-bold mb-8">Игра завершена!</h2>
                  <div className="text-center">
                    <p className="text-xl mb-4">Финальные результаты:</p>
                    {gameState.lastResults?.finalScores?.slice(0, 3).map((player: any, index: number) => (
                      <div key={player.id} className="mb-2">
                        <span className="text-2xl font-bold">
                          {index + 1}. {player.name} - {player.score} очков
                        </span>
                      </div>
                    ))}
                  </div>
                  <Button
                    onClick={handleExitGame}
                    className="bg-white text-primary hover:bg-gray-100 mt-8"
                  >
                    Закрыть игру
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Players Panel */}
        <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <PlayerList players={gameState.players} />
          
          {/* Host Controls */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              {isWaiting && (
                <Button
                  onClick={handleStartGame}
                  disabled={gameState.players.length < 2}
                  className="flex-1"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Начать
                </Button>
              )}
              {isInProgress && (
                <>
                  <Button onClick={handleNextQuestion} className="flex-1">
                    <ArrowRight className="w-4 h-4 mr-2" />
                    Далее
                  </Button>
                  <Button variant="outline" size="sm">
                    <Pause className="w-4 h-4" />
                  </Button>
                </>
              )}
              {isFinished && (
                <Button onClick={handleExitGame} className="flex-1">
                  Завершить
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
