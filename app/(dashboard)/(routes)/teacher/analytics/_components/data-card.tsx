import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/lib/format";

interface DataCardProps {
  value: number;
  label: string;
  shouldFormat?: boolean;
  /** Optional icon shown next to the label */
  icon?: LucideIcon;
  /** Optional subtitle below the value */
  trend?: string;
  /** When true, displays value with one decimal place (e.g. ratings) */
  isDecimal?: boolean;
}

export const DataCard = ({
  value,
  label,
  shouldFormat = true,
  icon: Icon,
  trend,
  isDecimal,
}: DataCardProps) => {
  const formatValue = () => {
    if (isDecimal) return value.toFixed(1);
    if (shouldFormat) return formatPrice(value);
    return value.toString();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {label}
        </CardTitle>
        {Icon && (
          <div className="rounded-lg bg-indigo-100 dark:bg-indigo-900 p-1.5">
            <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          {formatValue()}
          {isDecimal && (
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">
              / 5
            </span>
          )}
        </div>
        {trend && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {trend}
          </p>
        )}
      </CardContent>
    </Card>
  );
};
