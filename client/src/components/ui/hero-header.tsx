import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface HeroHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  children?: ReactNode;
  backgroundImage?: string;
  variant?: 'default' | 'legal' | 'dashboard' | 'privacy';
  className?: string;
}

export function HeroHeader({
  title,
  subtitle,
  description,
  children,
  backgroundImage,
  variant = 'default',
  className
}: HeroHeaderProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'legal':
        return {
          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)',
          pattern: 'bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:24px_24px]'
        };
      case 'dashboard':
        return {
          background: 'linear-gradient(135deg, #1f2937 0%, #374151 50%, #4b5563 100%)',
          pattern: 'bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[length:32px_32px]'
        };
      case 'privacy':
        return {
          background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #065f46 100%)',
          pattern: 'bg-[radial-gradient(circle_at_75%_25%,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[length:28px_28px]'
        };
      default:
        return {
          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #991b1b 100%)',
          pattern: 'bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:24px_24px]'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div 
      className={cn(
        "relative overflow-hidden",
        styles.pattern,
        className
      )}
      style={{ background: styles.background }}
    >
      {/* Background Image Overlay */}
      {backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30" />
      
      {/* Animated Particles */}
      <div className="absolute inset-0">
        <div className="absolute top-10 left-10 w-2 h-2 bg-white/20 rounded-full animate-pulse delay-0" />
        <div className="absolute top-32 right-20 w-1 h-1 bg-white/30 rounded-full animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-20 w-1.5 h-1.5 bg-white/25 rounded-full animate-pulse delay-2000" />
        <div className="absolute bottom-32 right-32 w-1 h-1 bg-white/20 rounded-full animate-pulse delay-3000" />
      </div>

      {/* Content */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="py-16 sm:py-20 lg:py-24">
            <div className="text-center">
              {/* Logo */}
              <div className="mb-8">
                <img 
                  src="https://upload.wikimedia.org/wikipedia/commons/3/32/Remondis_logo.svg" 
                  alt="Remondis" 
                  className="h-12 w-auto mx-auto filter brightness-0 invert"
                />
              </div>

              {/* Subtitle */}
              {subtitle && (
                <p className="text-sm font-semibold text-white/80 uppercase tracking-wider mb-4">
                  {subtitle}
                </p>
              )}

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                <span className="block">{title}</span>
              </h1>

              {/* Description */}
              {description && (
                <p className="max-w-3xl mx-auto text-lg sm:text-xl text-white/90 leading-relaxed mb-8">
                  {description}
                </p>
              )}

              {/* Children */}
              {children && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  {children}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg 
          viewBox="0 0 1200 120" 
          preserveAspectRatio="none" 
          className="relative block w-full h-12 sm:h-16 lg:h-20"
        >
          <path 
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
            opacity=".25" 
            className="fill-white"
          />
          <path 
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" 
            opacity=".5" 
            className="fill-white"
          />
          <path 
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" 
            className="fill-white"
          />
        </svg>
      </div>
    </div>
  );
}