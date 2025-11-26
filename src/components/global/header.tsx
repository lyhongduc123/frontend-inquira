import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Brand } from "./brand";

export function Header() {
  return (
    <div className="flex items-center justify-between px-4 py-2 gap-4 border-b border-border">
      <Brand showText />
      <Avatar>
        <AvatarImage src="https://picsum.photos/200" alt="User" />
        <AvatarFallback>U</AvatarFallback>
      </Avatar>
    </div>
  );
}
