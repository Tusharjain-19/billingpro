import { LucideIcon } from "lucide-react";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: LucideIcon;
  fullWidth?: boolean;
}

export const Button = ({ children, variant = 'primary', icon: Icon, fullWidth, className, ...props }: ButtonProps) => {
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20',
    secondary: 'bg-secondary text-white hover:bg-secondary/80 border border-border',
    ghost: 'bg-transparent text-foreground hover:bg-white/5',
    danger: 'bg-destructive text-white hover:bg-destructive/90',
  };

  return (
    <button 
      className={`
        flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50
        ${variants[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = ({ label, className, ...props }: InputProps) => {
  return (
    <div className="space-y-2 w-full">
      {label && <label className="text-xs font-bold text-muted-foreground uppercase ml-1">{label}</label>}
      <input 
        className={`
          w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all
          ${className}
        `}
        {...props}
      />
    </div>
  );
};
