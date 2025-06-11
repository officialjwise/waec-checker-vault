
import React from 'react';
import { cn } from '@/lib/utils';

const Shimmer: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      className={cn(
        'animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] rounded',
        className
      )}
      style={{
        animation: 'shimmer 1.5s ease-in-out infinite',
      }}
    />
  );
};

const StatCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2 flex-1">
          <Shimmer className="h-4 w-24" />
          <Shimmer className="h-8 w-32" />
          <Shimmer className="h-3 w-20" />
        </div>
        <Shimmer className="h-12 w-12 rounded-full" />
      </div>
    </div>
  );
};

const TableRowSkeleton: React.FC<{ columns?: number }> = ({ columns = 4 }) => {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, index) => (
        <td key={index} className="px-6 py-4">
          <Shimmer className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
};

const ChartSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-4">
        <Shimmer className="h-5 w-48" />
      </div>
      <div className="space-y-2">
        <Shimmer className="h-64 w-full" />
      </div>
    </div>
  );
};

export { Shimmer, StatCardSkeleton, TableRowSkeleton, ChartSkeleton };
