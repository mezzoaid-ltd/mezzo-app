"use client";

import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EnrollmentChartProps {
  data: { name: string; students: number }[];
}

export const EnrollmentChart = ({ data }: EnrollmentChartProps) => {
  // Only show months up to and including the current month
  const currentMonthIndex = new Date().getMonth();
  const visibleData = data.slice(0, currentMonthIndex + 1);

  // If no enrollments at all yet, still show the months but with zero
  const hasData = visibleData.some((d) => d.students > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-semibold text-gray-900 dark:text-white">
          Student Enrollment ({new Date().getFullYear()})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!hasData ? (
          <div className="h-[220px] flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            No enrollments yet this year.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={visibleData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="name"
                stroke="#888888"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                stroke="#888888"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  backgroundColor: "#fff",
                }}
                formatter={(value: number) => [value, "Students"]}
              />
              <Line
                type="monotone"
                dataKey="students"
                stroke="#6366f1"
                strokeWidth={2.5}
                dot={{ fill: "#6366f1", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
};
