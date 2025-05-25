
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowDown, ArrowRight, ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardStatsCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'neutral';
  trendColor?: 'positive' | 'negative' | 'neutral';
  valueClassName?: string;
}

const DashboardStatsCard = ({
  title,
  value,
  description,
  icon,
  trend,
  trendColor = trend === 'up' ? 'positive' : trend === 'down' ? 'negative' : 'neutral',
  valueClassName,
}: DashboardStatsCardProps) => {
  const renderTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="h-3 w-3" />;
      case 'down':
        return <ArrowDown className="h-3 w-3" />;
      default:
        return <ArrowRight className="h-3 w-3" />;
    }
  };

  return (
    <Card className="border-border bg-dashboard-card">
      <CardContent className="p-6">
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
            {icon}
          </div>
          <span className="text-xs font-medium text-muted-foreground">{title}</span>
        </div>
        <div className="mt-3">
          <div className={cn("text-2xl font-bold", valueClassName)}>
            {value}
          </div>
          <div className="mt-1 flex items-center text-xs">
            <span className={cn(
              "flex items-center gap-0.5",
              trendColor === 'positive' && "text-status-online",
              trendColor === 'negative' && "text-status-error",
              trendColor === 'neutral' && "text-muted-foreground"
            )}>
              {renderTrendIcon()}
            </span>
            <span className="ml-1 text-muted-foreground">{description}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardStatsCard;
