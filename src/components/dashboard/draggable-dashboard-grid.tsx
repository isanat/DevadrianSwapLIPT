'use client';

import React, { useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

import { StakingPool } from '@/components/dashboard/staking-pool';
import { LiquidityPool } from '@/components/dashboard/liquidity-pool';
import { StatsGroup } from '@/components/dashboard/stats-group';
import { TokenPurchase } from '@/components/dashboard/token-purchase';
import { ReferralDashboard } from '@/components/dashboard/referral-program';
import { MiningPool } from '@/components/dashboard/mining-pool';


const componentMap: { [key: string]: React.FC } = {
  stats: StatsGroup,
  staking: StakingPool,
  mining: MiningPool,
  liquidity: LiquidityPool,
  purchase: TokenPurchase,
  referral: ReferralDashboard,
};

const initialItems = [
  { id: 'stats', className: 'lg:col-span-3' },
  { id: 'staking', className: 'lg:col-span-2' },
  { id: 'mining', className: 'lg:col-span-1' },
  { id: 'liquidity', className: 'lg:col-span-1' },
  { id: 'purchase', className: 'lg:col-span-1' },
  { id: 'referral', className: 'lg:col-span-3' },
];

const SortableItem = ({ id, children, className }: { id: string, children: React.ReactNode, className: string }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 'auto',
    opacity: isDragging ? 0.7 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={cn("relative group", className)}>
      <div {...attributes} {...listeners} className="absolute top-3 right-3 z-10 p-2 cursor-grab bg-background/50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
        <GripVertical size={16} />
      </div>
      {children}
    </div>
  );
};


export const DraggableDashboardGrid = () => {
  const [items, setItems] = useState(initialItems);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const savedLayout = localStorage.getItem('dashboardLayout');
    if (savedLayout) {
        try {
            const parsedLayout = JSON.parse(savedLayout);
            const validLayout = parsedLayout.every((item: any) => typeof item.id === 'string' && initialItems.some(initItem => initItem.id === item.id));
            if (validLayout) {
                setItems(parsedLayout);
            }
        } catch (e) {
            // malformed JSON, ignore
        }
    }
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((currentItems) => {
        const oldIndex = currentItems.findIndex((item) => item.id === active.id);
        const newIndex = currentItems.findIndex((item) => item.id === over.id);
        const newOrder = arrayMove(currentItems, oldIndex, newIndex);
        localStorage.setItem('dashboardLayout', JSON.stringify(newOrder));
        return newOrder;
      });
    }
  };

  if (!isClient) {
    // Render a static layout on the server to avoid hydration mismatch
    return (
        <div className="grid gap-4 md:gap-8 lg:grid-cols-3 auto-rows-fr">
            <div className="lg:col-span-3"><StatsGroup/></div>
            <div className="lg:col-span-2"><StakingPool/></div>
            <div className="lg:col-span-1"><MiningPool/></div>
            <div className="lg:col-span-1"><LiquidityPool/></div>
            <div className="lg:col-span-1"><TokenPurchase/></div>
            <div className="lg:col-span-3"><ReferralDashboard/></div>
        </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map(item => item.id)} strategy={rectSortingStrategy}>
        <div className="grid gap-4 md:gap-8 lg:grid-cols-3 auto-rows-fr">
          {items.map(({ id, className }) => {
            const Component = componentMap[id];
            return (
              <SortableItem key={id} id={id} className={className}>
                <Component />
              </SortableItem>
            );
          })}
        </div>
      </SortableContext>
    </DndContext>
  );
};
