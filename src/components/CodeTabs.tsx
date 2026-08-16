import type { HTMLAttributes, ReactNode } from 'react';

interface CodeBlockTabsProps extends HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  children?: ReactNode;
}

interface CodeBlockTabsTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  value: string;
  children?: ReactNode;
}

interface CodeBlockTabProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  children?: ReactNode;
}

export function CodeBlockTabs({ defaultValue, className = '', children, ...props }: CodeBlockTabsProps) {
  return (
    <div
      {...props}
      data-code-tabs=""
      data-default-value={defaultValue}
      className={`my-4 overflow-hidden rounded-xl border bg-fd-card ${className}`.trim()}
    >
      {children}
    </div>
  );
}

export function CodeBlockTabsList({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      {...props}
      role="tablist"
      className={`flex flex-row overflow-x-auto px-2 text-fd-muted-foreground ${className}`.trim()}
    >
      {children}
    </div>
  );
}

export function CodeBlockTabsTrigger({ value, className = '', children, ...props }: CodeBlockTabsTriggerProps) {
  return (
    <button
      {...props}
      type="button"
      role="tab"
      data-tab-value={value}
      className={`group relative inline-flex items-center gap-2 px-2 py-1.5 text-nowrap text-sm font-medium hover:text-fd-accent-foreground data-[state=active]:text-fd-primary ${className}`.trim()}
    >
      <span className="absolute inset-x-2 bottom-0 h-px group-data-[state=active]:bg-fd-primary" />
      {children}
    </button>
  );
}

export function CodeBlockTab({ value, className = '', children, ...props }: CodeBlockTabProps) {
  return (
    <div
      {...props}
      role="tabpanel"
      data-tab-panel={value}
      className={className}
    >
      {children}
    </div>
  );
}
