export function LoadingDots() {
  return (
    <div className="flex space-x-1 items-center text-muted-foreground">
      <span className="animate-bounce">•</span>
      <span className="animate-bounce delay-100">•</span>
      <span className="animate-bounce delay-200">•</span>
    </div>
  );
}
