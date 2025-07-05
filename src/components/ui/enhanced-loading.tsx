import React from 'react';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface LoadingStateProps {
  isLoading: boolean;
  error?: Error | string | null;
  onRetry?: () => void;
  loadingText?: string;
  errorTitle?: string;
  children: React.ReactNode;
  showSkeleton?: boolean;
  skeletonCount?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  isLoading,
  error,
  onRetry,
  loadingText = 'Loading...',
  errorTitle = 'Something went wrong',
  children,
  showSkeleton = false,
  skeletonCount = 3,
}) => {
  if (error) {
    const errorMessage = typeof error === 'string' ? error : error.message;
    
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription className="flex flex-col gap-2">
          <div>
            <strong>{errorTitle}</strong>
            <p className="text-sm mt-1">{errorMessage}</p>
          </div>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="w-fit"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    if (showSkeleton) {
      return <LoadingSkeleton count={skeletonCount} />;
    }
    
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>{loadingText}</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

interface LoadingSkeletonProps {
  count?: number;
  className?: string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  count = 3,
  className,
}) => (
  <div className={cn("space-y-3", className)}>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="animate-pulse">
        <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-muted rounded w-1/2"></div>
      </div>
    ))}
  </div>
);

interface ProgressiveLoadingProps {
  steps: string[];
  currentStep: number;
  isComplete?: boolean;
  error?: string;
}

export const ProgressiveLoading: React.FC<ProgressiveLoadingProps> = ({
  steps,
  currentStep,
  isComplete = false,
  error,
}) => (
  <div className="space-y-4">
    {steps.map((step, index) => {
      const isActive = index === currentStep;
      const isCompleted = index < currentStep || isComplete;
      const hasError = error && isActive;

      return (
        <div
          key={index}
          className={cn(
            "flex items-center gap-3 p-3 rounded-lg transition-colors",
            isActive && !hasError && "bg-primary/5 border border-primary/20",
            hasError && "bg-destructive/5 border border-destructive/20"
          )}
        >
          <div className="flex-shrink-0">
            {hasError ? (
              <AlertCircle className="w-5 h-5 text-destructive" />
            ) : isCompleted ? (
              <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs">
                ✓
              </div>
            ) : isActive ? (
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/30" />
            )}
          </div>
          <span
            className={cn(
              "text-sm",
              isActive && "font-medium",
              isCompleted && "text-muted-foreground",
              hasError && "text-destructive"
            )}
          >
            {step}
          </span>
        </div>
      );
    })}
  </div>
);