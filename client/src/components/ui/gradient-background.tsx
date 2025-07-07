import { ReactNode } from "react";

interface GradientBackgroundProps {
  children: ReactNode;
  variant?: "primary" | "secondary" | "success" | "warning";
}

export default function GradientBackground({ 
  children, 
  variant = "primary" 
}: GradientBackgroundProps) {
  const gradients = {
    primary: "from-slate-50 via-red-50 to-orange-50",
    secondary: "from-blue-50 via-indigo-50 to-purple-50",
    success: "from-emerald-50 via-green-50 to-teal-50",
    warning: "from-yellow-50 via-orange-50 to-red-50"
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${gradients[variant]} relative overflow-hidden`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-32 w-96 h-96 rounded-full bg-red-100 opacity-30 animate-pulse"></div>
        <div className="absolute top-96 -left-32 w-80 h-80 rounded-full bg-orange-100 opacity-20 animate-bounce"></div>
        <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-yellow-100 opacity-25 animate-pulse"></div>
      </div>
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}