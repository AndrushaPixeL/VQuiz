# Развертывание Quiz Game Application

## Бесплатные альтернативы сервисам Replit

### База данных
Вместо Replit Database используйте любой из этих бесплатных PostgreSQL провайдеров:

1. **Supabase** (рекомендуется)
   - Бесплатно: 500MB хранилища, 2GB передачи данных
   - URL: https://supabase.com
   - Создайте проект и скопируйте connection string

2. **Neon** 
   - Бесплатно: 512MB хранилища, 3GB передачи данных
   - URL: https://neon.tech

3. **ElephantSQL**
   - Бесплатно: 20MB хранилища (подходит для тестирования)
   - URL: https://www.elephantsql.com

### Хостинг приложения
Вместо Replit Deployments используйте:

1. **Vercel** (рекомендуется для фронтенда + API)
   - Бесплатно: 100GB bandwidth, serverless functions
   - URL: https://vercel.com

2. **Netlify** (для статичных сайтов + functions)
   - Бесплатно: 100GB bandwidth, 125k function invocations
   - URL: https://netlify.com

3. **Railway** (для full-stack приложений)
   - Бесплатно: $5 кредитов в месяц
   - URL: https://railway.app

4. **Render** (для backend + PostgreSQL)
   - Бесплатно: 750 часов в месяц, PostgreSQL database
   - URL: https://render.com

## Инструкции по развертыванию

### 1. Настройка базы данных (Supabase)
```bash
# 1. Зарегистрируйтесь на supabase.com
# 2. Создайте новый проект
# 3. В разделе Settings > Database найдите Connection String
# 4. Установите переменную окружения:
export DATABASE_URL="postgresql://username:password@host:port/database"
```

### 2. Развертывание на Vercel
```bash
# 1. Установите Vercel CLI
npm i -g vercel

# 2. Войдите в аккаунт
vercel login

# 3. Разверните приложение
vercel

# 4. Добавьте переменные окружения в Vercel dashboard:
# DATABASE_URL - ваша строка подключения к базе данных
```

### 3. Альтернативное развертывание на Railway
```bash
# 1. Зарегистрируйтесь на railway.app
# 2. Подключите GitHub репозиторий
# 3. Добавьте переменные окружения:
# DATABASE_URL - строка подключения к базе данных
# PORT - порт для приложения (обычно 3000)
```

## Переменные окружения
Убедитесь, что следующие переменные установлены:

```env
DATABASE_URL=postgresql://username:password@host:port/database
NODE_ENV=production
PORT=3000
```

## Команды для развертывания
```bash
# Сборка приложения
npm run build

# Запуск в production
npm start

# Миграция базы данных (выполните один раз)
npm run db:push
```

## Примечания
- Приложение настроено для работы с обычным PostgreSQL вместо Neon
- Replit-специфические плагины удалены из конфигурации
- SSL соединение автоматически включается в production режиме