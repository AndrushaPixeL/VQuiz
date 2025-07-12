import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quizzes = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  createdBy: integer("created_by").references(() => users.id),
  isPublic: boolean("is_public").default(false),
  timeLimit: integer("time_limit").default(30),
  minPlayers: integer("min_players").default(2),
  maxPlayers: integer("max_players").default(20),
  useAudioNarration: boolean("use_audio_narration").default(false),
  questions: jsonb("questions").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id").references(() => quizzes.id),
  hostId: integer("host_id").references(() => users.id),
  gameCode: text("game_code").notNull().unique(),
  status: text("status").notNull(), // 'waiting', 'in_progress', 'finished'
  currentQuestion: integer("current_question").default(0),
  timeLeft: integer("time_left").default(0),
  players: jsonb("players").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const gameAnswers = pgTable("game_answers", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").references(() => games.id),
  playerId: text("player_id").notNull(),
  questionIndex: integer("question_index").notNull(),
  answer: text("answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  timeToAnswer: integer("time_to_answer").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertQuizSchema = createInsertSchema(quizzes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertGameSchema = createInsertSchema(games).omit({
  id: true,
  createdAt: true,
});

export const insertGameAnswerSchema = createInsertSchema(gameAnswers).omit({
  id: true,
  createdAt: true,
});

// Question schema
export const questionSchema = z.object({
  id: z.string(),
  type: z.enum(['multiple_choice', 'true_false', 'image_question', 'audio_question']),
  text: z.string(),
  image: z.string().optional(),
  audio: z.string().optional(),
  answers: z.array(z.object({
    id: z.string(),
    text: z.string(),
    isCorrect: z.boolean(),
  })),
  timeLimit: z.number().default(30),
  timerDelay: z.number().min(0).max(60).default(0), // Задержка таймера в секундах
  useAIVoice: z.boolean().default(false),
  aiVoiceText: z.string().optional(),
  customTimerDelay: z.number().optional(), // Пользовательская задержка
});

// Splash screen schema
export const splashScreenSchema = z.object({
  id: z.string(),
  type: z.enum(['start', 'round', 'end']),
  title: z.string(),
  subtitle: z.string().optional(),
  background: z.object({
    type: z.enum(['color', 'image', 'video']),
    value: z.string(),
  }).optional(),
  elements: z.array(z.object({
    id: z.string(),
    type: z.enum(['text', 'image', 'video']),
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
    content: z.string(),
    styles: z.record(z.any()),
  })).default([]),
});

// Results screen schema
export const resultsScreenSchema = z.object({
  id: z.string(),
  title: z.string().default('Результаты'),
  background: z.object({
    type: z.enum(['color', 'image', 'video']),
    value: z.string(),
  }).optional(),
  leaderboardStyle: z.object({
    position: z.object({ x: z.number(), y: z.number() }),
    size: z.object({ width: z.number(), height: z.number() }),
    style: z.enum(['classic', 'modern', 'minimal']),
    colors: z.object({
      background: z.string(),
      text: z.string(),
      accent: z.string(),
    }),
  }),
  elements: z.array(z.object({
    id: z.string(),
    type: z.enum(['text', 'image', 'video']),
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
    content: z.string(),
    styles: z.record(z.any()),
  })).default([]),
});

export const quizSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
  timeLimit: z.number().default(30),
  minPlayers: z.number().default(2),
  maxPlayers: z.number().default(20),
  useAudioNarration: z.boolean().default(false),
  aiVoice: z.string().optional(), // Выбранный голос ИИ для всех вопросов
  questionTemplate: z.string().optional(), // Шаблон для всех вопросов
  questions: z.array(questionSchema),
  splashScreens: z.array(splashScreenSchema).default([]),
  resultsScreens: z.array(resultsScreenSchema).default([]),
});

// Player schema
export const playerSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatar: z.string(),
  score: z.number().default(0),
  isHost: z.boolean().default(false),
  hasAnswered: z.boolean().default(false),
  currentAnswer: z.string().optional(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertQuiz = z.infer<typeof insertQuizSchema>;
export type Quiz = typeof quizzes.$inferSelect;
export type InsertGame = z.infer<typeof insertGameSchema>;
export type Game = typeof games.$inferSelect;
export type InsertGameAnswer = z.infer<typeof insertGameAnswerSchema>;
export type GameAnswer = typeof gameAnswers.$inferSelect;
export type Question = z.infer<typeof questionSchema>;
export type Player = z.infer<typeof playerSchema>;
export type SplashScreen = z.infer<typeof splashScreenSchema>;
export type ResultsScreen = z.infer<typeof resultsScreenSchema>;
