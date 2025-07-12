import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AvatarDisplay } from "@/components/avatar-selector";
import { cn } from "@/lib/utils";

interface Player {
  id: string;
  name: string;
  avatar: string;
  score: number;
  isHost: boolean;
  hasAnswered: boolean;
}

interface PlayerListProps {
  players: Player[];
  className?: string;
}

export function PlayerList({ players, className }: PlayerListProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <CardTitle>Игроки онлайн ({players.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {players.map((player) => (
            <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <AvatarDisplay avatar={player.avatar} />
                <div>
                  <span className="font-medium text-gray-900">{player.name}</span>
                  {player.isHost && (
                    <span className="ml-2 text-xs bg-primary text-white px-2 py-1 rounded">
                      Хост
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{player.score}</span>
                <div className={cn(
                  "w-3 h-3 rounded-full",
                  player.hasAnswered ? "bg-green-500 animate-pulse" : "bg-gray-300"
                )} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
