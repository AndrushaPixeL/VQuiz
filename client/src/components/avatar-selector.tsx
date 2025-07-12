import { cn } from "@/lib/utils";

interface AvatarSelectorProps {
  selected?: string;
  onSelect: (avatar: string) => void;
  className?: string;
}

const avatars = [
  { id: "user", icon: "fas fa-user", color: "bg-blue-500" },
  { id: "cat", icon: "fas fa-cat", color: "bg-pink-500" },
  { id: "rocket", icon: "fas fa-rocket", color: "bg-green-500" },
  { id: "star", icon: "fas fa-star", color: "bg-purple-500" },
  { id: "heart", icon: "fas fa-heart", color: "bg-orange-500" },
  { id: "crown", icon: "fas fa-crown", color: "bg-indigo-500" },
  { id: "fire", icon: "fas fa-fire", color: "bg-red-500" },
  { id: "leaf", icon: "fas fa-leaf", color: "bg-teal-500" },
];

export function AvatarSelector({ selected, onSelect, className }: AvatarSelectorProps) {
  return (
    <div className={cn("grid grid-cols-4 gap-3", className)}>
      {avatars.map((avatar) => (
        <button
          key={avatar.id}
          onClick={() => onSelect(avatar.id)}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center hover:scale-110 transition-transform",
            avatar.color,
            selected === avatar.id && "ring-2 ring-primary ring-offset-2"
          )}
        >
          <i className={cn(avatar.icon, "text-white")} />
        </button>
      ))}
    </div>
  );
}

export function AvatarDisplay({ avatar, className }: { avatar: string; className?: string }) {
  const avatarData = avatars.find(a => a.id === avatar);
  
  if (!avatarData) {
    return (
      <div className={cn("w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center", className)}>
        <i className="fas fa-user text-white text-sm" />
      </div>
    );
  }

  return (
    <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", avatarData.color, className)}>
      <i className={cn(avatarData.icon, "text-white text-sm")} />
    </div>
  );
}
