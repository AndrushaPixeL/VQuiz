import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { quizSchema, playerSchema, type Player, type Quiz, type Game } from "@shared/schema";
import { z } from "zod";

interface GameSession {
  id: number;
  quiz: Quiz;
  players: Map<string, Player>;
  currentQuestion: number;
  timeLeft: number;
  timer: NodeJS.Timeout | null;
  status: 'waiting' | 'in_progress' | 'finished';
  host: string;
}

const activeSessions = new Map<string, GameSession>();
const playerConnections = new Map<string, WebSocket>();

function generateGameCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function broadcastToGame(gameCode: string, message: any) {
  const session = activeSessions.get(gameCode);
  if (!session) return;

  session.players.forEach((player) => {
    const connection = playerConnections.get(player.id);
    if (connection && connection.readyState === WebSocket.OPEN) {
      connection.send(JSON.stringify(message));
    }
  });
}

function startQuestionTimer(gameCode: string) {
  const session = activeSessions.get(gameCode);
  if (!session) return;

  const question = session.quiz.questions[session.currentQuestion];
  if (!question) return;

  session.timeLeft = question.timeLimit || 30;
  
  session.timer = setInterval(() => {
    session.timeLeft--;
    
    broadcastToGame(gameCode, {
      type: 'timer_update',
      timeLeft: session.timeLeft
    });

    if (session.timeLeft <= 0) {
      if (session.timer) clearInterval(session.timer);
      endQuestion(gameCode);
    }
  }, 1000);
}

function endQuestion(gameCode: string) {
  const session = activeSessions.get(gameCode);
  if (!session) return;

  // Mark all players as answered
  session.players.forEach((player) => {
    player.hasAnswered = true;
  });

  // Show results
  broadcastToGame(gameCode, {
    type: 'question_ended',
    correctAnswer: session.quiz.questions[session.currentQuestion].answers.find(a => a.isCorrect)?.id,
    players: Array.from(session.players.values())
  });

  // Move to next question after 3 seconds
  setTimeout(() => {
    nextQuestion(gameCode);
  }, 3000);
}

function nextQuestion(gameCode: string) {
  const session = activeSessions.get(gameCode);
  if (!session) return;

  session.currentQuestion++;
  
  if (session.currentQuestion >= session.quiz.questions.length) {
    // Game finished
    session.status = 'finished';
    broadcastToGame(gameCode, {
      type: 'game_finished',
      players: Array.from(session.players.values()).sort((a, b) => b.score - a.score)
    });
    return;
  }

  // Reset players for next question
  session.players.forEach((player) => {
    player.hasAnswered = false;
    player.currentAnswer = undefined;
  });

  // Send next question
  const question = session.quiz.questions[session.currentQuestion];
  broadcastToGame(gameCode, {
    type: 'new_question',
    question: {
      ...question,
      answers: question.answers.map(a => ({ id: a.id, text: a.text })) // Don't send correct answer
    },
    currentQuestion: session.currentQuestion + 1,
    totalQuestions: session.quiz.questions.length
  });

  startQuestionTimer(gameCode);
}

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // Quiz API routes
  app.get("/api/quizzes", async (req, res) => {
    try {
      const quizzes = await storage.getQuizzesByUser(1); // Demo user
      res.json(quizzes);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quizzes" });
    }
  });

  app.get("/api/quizzes/:id", async (req, res) => {
    try {
      const quiz = await storage.getQuiz(parseInt(req.params.id));
      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }
      res.json(quiz);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch quiz" });
    }
  });

  app.post("/api/quizzes", async (req, res) => {
    try {
      const validatedData = quizSchema.parse(req.body);
      const quiz = await storage.createQuiz({
        ...validatedData,
        createdBy: 1, // Demo user
        questions: validatedData.questions
      });
      res.json(quiz);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid quiz data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create quiz" });
    }
  });

  app.put("/api/quizzes/:id", async (req, res) => {
    try {
      const validatedData = quizSchema.parse(req.body);
      const quiz = await storage.updateQuiz(parseInt(req.params.id), {
        ...validatedData,
        questions: validatedData.questions
      });
      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }
      res.json(quiz);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid quiz data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update quiz" });
    }
  });

  app.delete("/api/quizzes/:id", async (req, res) => {
    try {
      const success = await storage.deleteQuiz(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ error: "Quiz not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete quiz" });
    }
  });

  // Game API routes
  app.post("/api/games", async (req, res) => {
    try {
      const { quizId } = req.body;
      const quiz = await storage.getQuiz(quizId);
      if (!quiz) {
        return res.status(404).json({ error: "Quiz not found" });
      }

      const gameCode = generateGameCode();
      const game = await storage.createGame({
        quizId,
        hostId: 1, // Demo user
        gameCode,
        status: 'waiting',
        currentQuestion: 0,
        timeLeft: 0,
        players: []
      });

      // Create session
      const session: GameSession = {
        id: game.id,
        quiz,
        players: new Map(),
        currentQuestion: 0,
        timeLeft: 0,
        timer: null,
        status: 'waiting',
        host: ''
      };

      activeSessions.set(gameCode, session);

      res.json({ gameCode, gameId: game.id });
    } catch (error) {
      res.status(500).json({ error: "Failed to create game" });
    }
  });

  app.get("/api/games/:gameCode", async (req, res) => {
    try {
      const session = activeSessions.get(req.params.gameCode);
      if (!session) {
        return res.status(404).json({ error: "Game not found" });
      }

      res.json({
        gameCode: req.params.gameCode,
        quiz: session.quiz,
        players: Array.from(session.players.values()),
        currentQuestion: session.currentQuestion,
        status: session.status
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch game" });
    }
  });

  // WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on('connection', (ws) => {
    let playerId: string | null = null;
    let gameCode: string | null = null;

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());

        switch (data.type) {
          case 'join_game':
            const { gameCode: code, player: playerData } = data;
            const session = activeSessions.get(code);
            
            if (!session) {
              ws.send(JSON.stringify({ type: 'error', message: 'Game not found' }));
              return;
            }

            if (session.players.size >= (session.quiz.maxPlayers || 20)) {
              ws.send(JSON.stringify({ type: 'error', message: 'Game is full' }));
              return;
            }

            playerId = playerData.id;
            gameCode = code;
            
            // Validate player data
            const validatedPlayer = playerSchema.parse(playerData);
            session.players.set(playerId, validatedPlayer);
            playerConnections.set(playerId, ws);

            // Set first player as host
            if (session.players.size === 1) {
              session.host = playerId;
              validatedPlayer.isHost = true;
            }

            ws.send(JSON.stringify({
              type: 'joined_game',
              gameCode: code,
              player: validatedPlayer,
              quiz: {
                title: session.quiz.title,
                description: session.quiz.description
              }
            }));

            // Broadcast to all players
            broadcastToGame(code, {
              type: 'player_joined',
              player: validatedPlayer,
              players: Array.from(session.players.values())
            });
            break;

          case 'start_game':
            if (!gameCode || !playerId) return;
            
            const gameSession = activeSessions.get(gameCode);
            if (!gameSession || gameSession.host !== playerId) {
              ws.send(JSON.stringify({ type: 'error', message: 'Not authorized to start game' }));
              return;
            }

            if (gameSession.players.size < gameSession.quiz.minPlayers) {
              ws.send(JSON.stringify({ type: 'error', message: 'Not enough players' }));
              return;
            }

            gameSession.status = 'in_progress';
            gameSession.currentQuestion = 0;

            // Send first question
            const firstQuestion = gameSession.quiz.questions[0];
            broadcastToGame(gameCode, {
              type: 'game_started',
              question: {
                ...firstQuestion,
                answers: firstQuestion.answers.map(a => ({ id: a.id, text: a.text }))
              },
              currentQuestion: 1,
              totalQuestions: gameSession.quiz.questions.length
            });

            startQuestionTimer(gameCode);
            break;

          case 'submit_answer':
            if (!gameCode || !playerId) return;
            
            const session2 = activeSessions.get(gameCode);
            if (!session2) return;

            const currentPlayer = session2.players.get(playerId);
            if (!currentPlayer || currentPlayer.hasAnswered) return;

            const { answer } = data;
            const currentQuestion = (session2.quiz.questions as any[])[session2.currentQuestion];
            const correctAnswer = currentQuestion.answers.find((a: any) => a.isCorrect);
            const isCorrect = correctAnswer?.id === answer;

            currentPlayer.hasAnswered = true;
            currentPlayer.currentAnswer = answer;
            
            if (isCorrect) {
              const timeBonus = Math.max(0, session2.timeLeft * 10);
              currentPlayer.score += 1000 + timeBonus;
            }

            // Check if all players have answered
            const allAnswered = Array.from(session2.players.values()).every(p => p.hasAnswered);
            
            if (allAnswered) {
              if (session2.timer) clearInterval(session2.timer);
              endQuestion(gameCode);
            } else {
              // Broadcast updated players
              broadcastToGame(gameCode, {
                type: 'player_answered',
                players: Array.from(session2.players.values())
              });
            }
            break;

          case 'next_question':
            if (!gameCode || !playerId) return;
            
            const session3 = activeSessions.get(gameCode);
            if (!session3 || session3.host !== playerId) return;

            nextQuestion(gameCode);
            break;
        }
      } catch (error) {
        console.error('WebSocket error:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      if (playerId && gameCode) {
        const session = activeSessions.get(gameCode);
        if (session) {
          session.players.delete(playerId);
          playerConnections.delete(playerId);
          
          // If host left, assign new host
          if (session.host === playerId && session.players.size > 0) {
            const newHost = Array.from(session.players.values())[0];
            session.host = newHost.id;
            newHost.isHost = true;
          }

          // Clean up empty sessions
          if (session.players.size === 0) {
            if (session.timer) clearInterval(session.timer);
            activeSessions.delete(gameCode);
          } else {
            broadcastToGame(gameCode, {
              type: 'player_left',
              playerId,
              players: Array.from(session.players.values())
            });
          }
        }
      }
    });
  });

  return httpServer;
}
