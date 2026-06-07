import { LucideIcon } from "lucide-react";

interface GameHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export function GameHeader({ icon: Icon, title, description }: GameHeaderProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center">
        <Icon className="h-8 w-8 text-primary-foreground" />
      </div>
      <div>
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
