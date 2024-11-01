import { cn } from '@/lib/utils';
import { useTheme } from '@/providers/theme-provider';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'white';
}

const sizeClasses = {
  sm: 'h-6',
  md: 'h-8',
  lg: 'h-10',
};

export function Logo({ className, size = 'md', variant = 'default' }: LogoProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        className={cn(sizeClasses[size], {
          'text-primary': variant === 'default' && !isDark,
          'text-primary-dark': variant === 'default' && isDark,
          'text-white': variant === 'white',
        })}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M16 8C13.79 8 12 9.79 12 12C12 14.21 13.79 16 16 16C18.21 16 20 14.21 20 12C20 9.79 18.21 8 16 8Z"
          fill="currentColor"
        />
        <path
          d="M16 2C8.27 2 2 8.27 2 16C2 23.73 8.27 30 16 30C23.73 30 30 23.73 30 16C30 8.27 23.73 2 16 2ZM24.5 16.5C24.5 20.64 21.14 24 17 24C15.04 24 13.27 23.19 11.97 21.91C9.91 19.85 9.91 16.45 11.97 14.39C13.21 13.15 14.88 12.5 16.67 12.5C18.46 12.5 20.13 13.15 21.37 14.39C22.61 15.63 23.26 17.3 23.26 19.09C23.26 19.47 23.22 19.85 23.13 20.21C23.04 20.57 22.91 20.92 22.74 21.24C22.57 21.56 22.36 21.86 22.11 22.11C21.86 22.36 21.56 22.57 21.24 22.74C20.92 22.91 20.57 23.04 20.21 23.13C19.85 23.22 19.47 23.26 19.09 23.26C18.71 23.26 18.33 23.22 17.97 23.13C17.61 23.04 17.26 22.91 16.94 22.74C16.62 22.57 16.32 22.36 16.07 22.11C15.82 21.86 15.61 21.56 15.44 21.24C15.27 20.92 15.14 20.57 15.05 20.21C14.96 19.85 14.92 19.47 14.92 19.09C14.92 18.71 14.96 18.33 15.05 17.97C15.14 17.61 15.27 17.26 15.44 16.94C15.61 16.62 15.82 16.32 16.07 16.07C16.32 15.82 16.62 15.61 16.94 15.44C17.26 15.27 17.61 15.14 17.97 15.05C18.33 14.96 18.71 14.92 19.09 14.92C19.47 14.92 19.85 14.96 20.21 15.05C20.57 15.14 20.92 15.27 21.24 15.44C21.56 15.61 21.86 15.82 22.11 16.07C22.36 16.32 22.57 16.62 22.74 16.94C22.91 17.26 23.04 17.61 23.13 17.97C23.22 18.33 23.26 18.71 23.26 19.09C23.26 19.47 23.22 19.85 23.13 20.21C23.04 20.57 22.91 20.92 22.74 21.24C22.57 21.56 22.36 21.86 22.11 22.11C21.86 22.36 21.56 22.57 21.24 22.74C20.92 22.91 20.57 23.04 20.21 23.13C19.85 23.22 19.47 23.26 19.09 23.26C18.71 23.26 18.33 23.22 17.97 23.13C17.61 23.04 17.26 22.91 16.94 22.74"
          fill="currentColor"
          fillOpacity="0.4"
        />
      </svg>
      <span
        className={cn('font-semibold', {
          'text-lg': size === 'sm',
          'text-xl': size === 'md',
          'text-2xl': size === 'lg',
          'text-foreground': variant === 'default',
          'text-white': variant === 'white',
        })}
      >
        BeFriends
      </span>
    </div>
  );
}
