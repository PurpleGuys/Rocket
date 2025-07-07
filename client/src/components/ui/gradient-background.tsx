export default function GradientBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 animate-gradient-x" />
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-50/30 via-purple-50/20 to-pink-50/30 animate-gradient-y" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}