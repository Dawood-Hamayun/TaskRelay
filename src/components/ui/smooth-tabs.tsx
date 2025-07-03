// frontend/src/components/ui/smooth-tabs.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode, useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface Tab {
  key: string;
  label: string;
  icon?: React.ComponentType<any>;
  content: ReactNode;
}

interface SmoothTabsProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabKey: string) => void;
  className?: string;
}

export function SmoothTabs({ tabs, activeTab, onTabChange, className }: SmoothTabsProps) {
  const [indicatorStyle, setIndicatorStyle] = useState({ width: 0, left: 0 });
  const tabsRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !tabsRef.current) return;

    const activeTabElement = tabsRef.current.querySelector(
      `[data-tab="${activeTab}"]`
    ) as HTMLElement;

    if (activeTabElement) {
      const { offsetLeft, offsetWidth } = activeTabElement;
      setIndicatorStyle({
        left: offsetLeft,
        width: offsetWidth,
      });
    }
  }, [activeTab, mounted]);

  const activeTabData = tabs.find(tab => tab.key === activeTab);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Tab Navigation */}
      <div className="relative">
        <div 
          ref={tabsRef}
          className="flex space-x-1 bg-muted/30 p-1 rounded-lg relative"
        >
          {/* Animated Indicator */}
          <motion.div
            className="absolute top-1 bottom-1 bg-background rounded-md shadow-sm border border-border/50"
            initial={false}
            animate={{
              left: indicatorStyle.left,
              width: indicatorStyle.width,
            }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
            }}
          />

          {/* Tab Buttons */}
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            
            return (
              <button
                key={tab.key}
                data-tab={tab.key}
                onClick={() => onTabChange(tab.key)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200 rounded-md z-10",
                  "hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20",
                  isActive 
                    ? "text-foreground" 
                    : "text-muted-foreground hover:text-foreground/80"
                )}
              >
                {Icon && (
                  <motion.div
                    animate={{ 
                      scale: isActive ? 1.1 : 1,
                      rotate: isActive ? 5 : 0 
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <Icon className="w-4 h-4" />
                  </motion.div>
                )}
                <span>{tab.label}</span>
                
                {/* Active indicator dot */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="w-1.5 h-1.5 bg-primary rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="relative min-h-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{
              duration: 0.25,
              ease: [0.22, 1, 0.36, 1]
            }}
            className="w-full"
          >
            {activeTabData?.content}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}