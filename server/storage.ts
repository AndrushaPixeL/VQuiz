import { quizzes, games, users, gameAnswers, type User, type InsertUser, type Quiz, type InsertQuiz, type Game, type InsertGame, type GameAnswer, type InsertGameAnswer } from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Quiz methods
  getQuiz(id: number): Promise<Quiz | undefined>;
  getQuizzesByUser(userId: number): Promise<Quiz[]>;
  getPublicQuizzes(): Promise<Quiz[]>;
  createQuiz(quiz: InsertQuiz): Promise<Quiz>;
  updateQuiz(id: number, quiz: Partial<InsertQuiz>): Promise<Quiz | undefined>;
  deleteQuiz(id: number): Promise<boolean>;

  // Game methods
  getGame(id: number): Promise<Game | undefined>;
  getGameByCode(gameCode: string): Promise<Game | undefined>;
  createGame(game: InsertGame): Promise<Game>;
  updateGame(id: number, game: Partial<InsertGame>): Promise<Game | undefined>;
  deleteGame(id: number): Promise<boolean>;

  // Game answer methods
  createGameAnswer(answer: InsertGameAnswer): Promise<GameAnswer>;
  getGameAnswers(gameId: number): Promise<GameAnswer[]>;
  getPlayerAnswers(gameId: number, playerId: string): Promise<GameAnswer[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private quizzes: Map<number, Quiz>;
  private games: Map<number, Game>;
  private gameAnswers: Map<number, GameAnswer>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.quizzes = new Map();
    this.games = new Map();
    this.gameAnswers = new Map();
    this.currentId = 1;

    // Add demo user
    this.users.set(1, {
      id: 1,
      username: "demo",
      password: "demo",
      createdAt: new Date(),
    });

    // Add demo quizzes
    this.quizzes.set(1, {
      id: 1,
      title: "Математика 9 класс",
      description: "Квиз по математике для 9 класса",
      createdBy: 1,
      isPublic: true,
      timeLimit: 30,
      minPlayers: 2,
      maxPlayers: 20,
      useAudioNarration: false,
      questions: [
        {
          id: "1",
          type: "multiple_choice",
          text: "Какой результат получится при решении уравнения: 2x + 5 = 15?",
          answers: [
            { id: "a", text: "x = 5", isCorrect: true },
            { id: "b", text: "x = 10", isCorrect: false },
            { id: "c", text: "x = 15", isCorrect: false },
            { id: "d", text: "x = 20", isCorrect: false },
          ],
          timeLimit: 30,
        },
        {
          id: "2",
          type: "multiple_choice",
          text: "Чему равна площадь квадрата со стороной 5 см?",
          answers: [
            { id: "a", text: "10 см²", isCorrect: false },
            { id: "b", text: "20 см²", isCorrect: false },
            { id: "c", text: "25 см²", isCorrect: true },
            { id: "d", text: "30 см²", isCorrect: false },
          ],
          timeLimit: 30,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.quizzes.set(2, {
      id: 2,
      title: "История России",
      description: "Квиз по истории России",
      createdBy: 1,
      isPublic: false,
      timeLimit: 30,
      minPlayers: 2,
      maxPlayers: 20,
      useAudioNarration: false,
      questions: [
        {
          id: "1",
          type: "multiple_choice",
          text: "В каком году началась Великая Отечественная война?",
          answers: [
            { id: "a", text: "1939", isCorrect: false },
            { id: "b", text: "1941", isCorrect: true },
            { id: "c", text: "1942", isCorrect: false },
            { id: "d", text: "1945", isCorrect: false },
          ],
          timeLimit: 30,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    this.currentId = 3;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id, createdAt: new Date() };
    this.users.set(id, user);
    return user;
  }

  async getQuiz(id: number): Promise<Quiz | undefined> {
    return this.quizzes.get(id);
  }

  async getQuizzesByUser(userId: number): Promise<Quiz[]> {
    return Array.from(this.quizzes.values()).filter(quiz => quiz.createdBy === userId);
  }

  async getPublicQuizzes(): Promise<Quiz[]> {
    return Array.from(this.quizzes.values()).filter(quiz => quiz.isPublic);
  }

  async createQuiz(insertQuiz: InsertQuiz): Promise<Quiz> {
    const id = this.currentId++;
    const quiz: Quiz = { 
      ...insertQuiz, 
      id, 
      createdAt: new Date(), 
      updatedAt: new Date() 
    };
    this.quizzes.set(id, quiz);
    return quiz;
  }

  async updateQuiz(id: number, updates: Partial<InsertQuiz>): Promise<Quiz | undefined> {
    const quiz = this.quizzes.get(id);
    if (!quiz) return undefined;
    
    const updatedQuiz: Quiz = { 
      ...quiz, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.quizzes.set(id, updatedQuiz);
    return updatedQuiz;
  }

  async deleteQuiz(id: number): Promise<boolean> {
    return this.quizzes.delete(id);
  }

  async getGame(id: number): Promise<Game | undefined> {
    return this.games.get(id);
  }

  async getGameByCode(gameCode: string): Promise<Game | undefined> {
    return Array.from(this.games.values()).find(game => game.gameCode === gameCode);
  }

  async createGame(insertGame: InsertGame): Promise<Game> {
    const id = this.currentId++;
    const game: Game = { 
      ...insertGame, 
      id, 
      createdAt: new Date() 
    };
    this.games.set(id, game);
    return game;
  }

  async updateGame(id: number, updates: Partial<InsertGame>): Promise<Game | undefined> {
    const game = this.games.get(id);
    if (!game) return undefined;
    
    const updatedGame: Game = { ...game, ...updates };
    this.games.set(id, updatedGame);
    return updatedGame;
  }

  async deleteGame(id: number): Promise<boolean> {
    return this.games.delete(id);
  }

  async createGameAnswer(insertAnswer: InsertGameAnswer): Promise<GameAnswer> {
    const id = this.currentId++;
    const answer: GameAnswer = { 
      ...insertAnswer, 
      id, 
      createdAt: new Date() 
    };
    this.gameAnswers.set(id, answer);
    return answer;
  }

  async getGameAnswers(gameId: number): Promise<GameAnswer[]> {
    return Array.from(this.gameAnswers.values()).filter(answer => answer.gameId === gameId);
  }

  async getPlayerAnswers(gameId: number, playerId: string): Promise<GameAnswer[]> {
    return Array.from(this.gameAnswers.values()).filter(
      answer => answer.gameId === gameId && answer.playerId === playerId
    );
  }
}

export const storage = new MemStorage();
