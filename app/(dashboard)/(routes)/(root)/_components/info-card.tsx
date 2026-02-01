import { LucideIcon } from "lucide-react";

import { IconBadge } from "@/components/icon-badge";

interface InfoCardProps {
  numberOfItems: number;
  variant?: "default" | "success";
  label: string;
  icon: LucideIcon;
  /** When provided, displays as "X of Y" instead of "X Courses" */
  totalItems?: number;
  /** When true, appends % to the number instead of "Course(s)" */
  isPercentage?: boolean;
}

export const InfoCard = ({
  variant,
  icon: Icon,
  numberOfItems,
  label,
  totalItems,
  isPercentage,
}: InfoCardProps) => {
  const getSubLabel = () => {
    if (isPercentage) {
      return `${numberOfItems}%`;
    }
    if (totalItems !== undefined) {
      return `${numberOfItems} of ${totalItems}`;
    }
    return `${numberOfItems} ${numberOfItems === 1 ? "Course" : "Courses"}`;
  };

  return (
    <div className="border rounded-md flex items-center gap-x-2 p-3 bg-white dark:bg-gray-800 dark:border-gray-700">
      <IconBadge variant={variant} icon={Icon} />
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{label}</p>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {getSubLabel()}
        </p>
      </div>
    </div>
  );
};
