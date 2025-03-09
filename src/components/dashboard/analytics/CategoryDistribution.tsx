
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

interface CategoryChartData {
  name: string;
  value: number;
}

interface CategoryDistributionProps {
  categoryChartData: CategoryChartData[];
  totalPosts: number;
}

export const CategoryDistribution = React.memo(({ categoryChartData, totalPosts }: CategoryDistributionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Distribusi Kategori Konten</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-60 flex items-center justify-center">
          {/* Simple visual representation of category data */}
          <div className="flex flex-col w-full gap-2">
            {categoryChartData.map((item, index) => (
              <div key={index} className="w-full">
                <div className="flex justify-between text-sm mb-1">
                  <span>{item.name}</span>
                  <span>{item.value} artikel</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-4">
                  <div 
                    className="bg-primary rounded-full h-4" 
                    style={{ width: `${Math.max((item.value / totalPosts) * 100, 2)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

CategoryDistribution.displayName = 'CategoryDistribution';
