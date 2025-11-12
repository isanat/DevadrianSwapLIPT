'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import * as Collapsible from '@radix-ui/react-collapsible';
import { cn } from '@/lib/utils';
import { buttonVariants } from './button';
import { ChevronDown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

const Sidebar = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <aside
        ref={ref}
        className={cn(
            'fixed inset-y-0 left-0 z-40 hidden h-full w-14 flex-col border-r bg-background sm:flex transition-all duration-300 ease-in-out',
            className
        )}
        {...props}
    />
));
Sidebar.displayName = 'Sidebar';


const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <header 
    ref={ref}
    className={cn("flex h-14 items-center justify-center border-b px-4 lg:h-[60px] lg:px-6", className)}
    {...props}
  />
));
SidebarHeader.displayName = 'SidebarHeader';

const SidebarMenu = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <nav
        ref={ref}
        className={cn(
            'flex flex-col items-center gap-1 px-2 py-4 flex-1',
            className
        )}
        {...props}
    />
));
SidebarMenu.displayName = 'SidebarMenu';


const SidebarMenuItem = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn('w-full', className)} {...props} />
));
SidebarMenuItem.displayName = 'SidebarMenuItem';


const sidebarMenuButtonVariants = cva(
  cn(
    buttonVariants({ variant: 'ghost' }),
    'w-full justify-start gap-3 rounded-lg text-muted-foreground'
  ),
  {
    variants: {
      size: {
        default: 'h-10 px-2.5',
        sm: 'h-9 px-2.5',
      },
      isActive: {
        true: 'bg-sidebar-accent text-sidebar-accent-foreground',
        false: 'hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground',
      },
    },
    defaultVariants: {
      size: 'default',
      isActive: false,
    },
  }
);

export interface SidebarMenuButtonProps
  extends React.ComponentPropsWithoutRef<'a'>,
    VariantProps<typeof sidebarMenuButtonVariants> {
  asChild?: boolean;
}

const SidebarMenuButton = React.forwardRef<HTMLAnchorElement, SidebarMenuButtonProps>(
  ({ className, size, isActive, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn(sidebarMenuButtonVariants({ size, isActive, className }))}
        {...props}
      />
    );
  }
);
SidebarMenuButton.displayName = 'SidebarMenuButton';


// Submenu
const SidebarMenuSub = Collapsible.Root;

const SidebarMenuSubTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Collapsible.Trigger>
>(({ className, children, ...props }, ref) => {
  const button = React.Children.only(children) as React.ReactElement;
  return (
    <Collapsible.Trigger ref={ref} className={cn('w-full', className)} {...props} asChild>
        {React.cloneElement(button, {
            className: cn(button.props.className, 'relative'),
            children: (
                <>
                    {button.props.children}
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 size-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </>
            )
        })}
    </Collapsible.Trigger>
  )
});
SidebarMenuSubTrigger.displayName = 'SidebarMenuSubTrigger';


const SidebarMenuSubContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Collapsible.Content>
>(({ className, ...props }, ref) => (
  <Collapsible.Content
    ref={ref}
    className={cn(
      "overflow-hidden text-sm transition-all data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down space-y-1 pl-4",
      className
    )}
    {...props}
  />
));
SidebarMenuSubContent.displayName = 'SidebarMenuSubContent';


export {
    Sidebar,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuSub,
    SidebarMenuSubTrigger,
    SidebarMenuSubContent,
};
