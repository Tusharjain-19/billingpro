'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface NavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
}

export function NavItem({ href, icon: Icon, label }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} style={{
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      width: "68px",
      height: "68px",
      textDecoration: "none",
      color: isActive ? "var(--primary)" : "var(--muted)",
      transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
    }}>
      {isActive && (
        <motion.div
          layoutId="nav-glow"
          style={{
            position: "absolute",
            inset: 8,
            background: "rgba(var(--primary-rgb), 0.1)",
            borderRadius: "20px",
            zIndex: 0,
            border: "1px solid rgba(var(--primary-rgb), 0.15)"
          }}
          transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
        />
      )}
      <div style={{ position: "relative", zIndex: 1, transform: isActive ? "translateY(-1px) scale(1.1)" : "none", transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)" }}>
        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
      </div>
      <span style={{
        position: "relative",
        zIndex: 1,
        fontSize: "10px",
        fontWeight: 900,
        marginTop: "4px",
        letterSpacing: "0.02em",
        textTransform: "uppercase",
        opacity: isActive ? 1 : 0.6,
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }}>
        {label}
      </span>
    </Link>
  );
}
