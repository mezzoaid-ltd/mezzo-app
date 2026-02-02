// "use client";

// interface ProgressRingProps {
//   progress: number; // 0–100
//   size?: number;
//   strokeWidth?: number;
// }

// export const ProgressRing = ({
//   progress,
//   size = 120,
//   strokeWidth = 10,
// }: ProgressRingProps) => {
//   const radius = (size - strokeWidth) / 2;
//   const circumference = 2 * Math.PI * radius;
//   const strokeDashoffset = circumference - (progress / 100) * circumference;

//   // Color based on progress
//   const getColor = () => {
//     if (progress >= 75) return "#22c55e"; // green
//     if (progress >= 40) return "#8b5cf6"; // purple
//     return "#6366f1"; // indigo
//   };

//   return (
//     <div className="flex flex-col items-center">
//       <svg width={size} height={size} className="-rotate-90">
//         {/* Background circle */}
//         <circle
//           cx={size / 2}
//           cy={size / 2}
//           r={radius}
//           fill="none"
//           stroke="currentColor"
//           strokeWidth={strokeWidth}
//           className="text-gray-200 dark:text-gray-700"
//         />
//         {/* Progress circle */}
//         <circle
//           cx={size / 2}
//           cy={size / 2}
//           r={radius}
//           fill="none"
//           stroke={getColor()}
//           strokeWidth={strokeWidth}
//           strokeDasharray={circumference}
//           strokeDashoffset={strokeDashoffset}
//           strokeLinecap="round"
//           style={{ transition: "stroke-dashoffset 0.6s ease" }}
//         />
//       </svg>
//       {/* Label inside — positioned over the SVG */}
//       <div className="absolute flex flex-col items-center justify-center">
//         <span className="text-2xl font-bold text-gray-900 dark:text-white">
//           {progress}%
//         </span>
//         <span className="text-xs text-gray-500 dark:text-gray-400">
//           Avg Progress
//         </span>
//       </div>
//     </div>
//   );
// };

"use client";

interface ProgressRingProps {
  progress: number; // 0–100
  size?: number;
  strokeWidth?: number;
}

export const ProgressRing = ({
  progress,
  size = 120,
  strokeWidth = 10,
}: ProgressRingProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  // Color based on progress
  const getColor = () => {
    if (progress >= 75) return "#22c55e"; // green
    if (progress >= 40) return "#8b5cf6"; // purple
    return "#6366f1"; // indigo
  };

  return (
    <div
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getColor()}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>
      {/* Label inside — positioned over the SVG */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          {progress}%
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Avg Progress
        </span>
      </div>
    </div>
  );
};
