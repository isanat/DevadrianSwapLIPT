'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useIsMobile } from "@/hooks/use-mobile";
import { HelpCircle } from "lucide-react";
import { useState } from "react";

type HelpTooltipProps = {
  title: string;
  content: React.ReactNode;
};

export function HelpTooltip({ title, content }: HelpTooltipProps) {
  const isMobile = useIsMobile();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => setIsDialogOpen(true)}
        >
          <HelpCircle size={18} className="text-muted-foreground" />
        </Button>
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" />
                {title}
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="pt-2 text-foreground">{content}</div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setIsDialogOpen(false)}>
                Entendi
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
          <HelpCircle size={18} className="text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="max-w-xs" align="end">
        <div className="space-y-2">
           <h4 className="font-medium leading-none flex items-center gap-2">
             <HelpCircle className="h-5 w-5 text-primary" />
            {title}
           </h4>
           <div className="text-sm text-muted-foreground">
             {content}
           </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
