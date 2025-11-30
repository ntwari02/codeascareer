import React from 'react';
import { motion } from 'framer-motion';

interface DataPoint {
  date: string;
  value: number;
  isForecast?: boolean;
  annotation?: string;
}

interface TrendLineChartProps {
  data: DataPoint[];
  forecastData?: DataPoint[];
  title?: string;
  height?: number;
  color?: string;
  yAxisLabel?: string;
  annotations?: Array<{ date: string; label: string; value: number }>;
}

export function TrendLineChart({
  data,
  forecastData = [],
  title,
  height = 300,
  color = 'from-red-500 to-orange-500',
  yAxisLabel = 'Value',
  annotations = [],
}: TrendLineChartProps) {
  const allData = [...data, ...forecastData];
  const maxValue = Math.max(...allData.map(d => d.value));
  const minValue = Math.min(...allData.map(d => d.value));
  const range = maxValue - minValue || 1;
  const chartHeight = height - 60;
  const chartWidth = 100;

  const getYPosition = (value: number) => {
    return chartHeight - ((value - minValue) / range) * chartHeight;
  };

  const getXPosition = (index: number, total: number) => {
    return (index / (total - 1)) * chartWidth;
  };

  // Create path for the line
  const createPath = (dataPoints: DataPoint[]) => {
    return dataPoints.map((point, index) => {
      const x = getXPosition(index, dataPoints.length);
      const y = getYPosition(point.value);
      return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
    }).join(' ');
  };

  const historicalPath = createPath(data);
  const forecastPath = forecastData.length > 0 ? createPath([data[data.length - 1], ...forecastData]) : '';

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      )}
      <div className="relative" style={{ height: `${height}px` }}>
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`}
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = chartHeight - (ratio * chartHeight);
            const value = minValue + (range * ratio);
            return (
              <g key={ratio}>
                <line
                  x1="0"
                  y1={y}
                  x2={chartWidth}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="0.5"
                  className="text-gray-200 dark:text-gray-700"
                  strokeDasharray="2,2"
                />
                <text
                  x="-2"
                  y={y + 3}
                  textAnchor="end"
                  className="text-xs fill-gray-600 dark:fill-gray-400"
                  fontSize="8"
                >
                  ${(value / 1000).toFixed(0)}k
                </text>
              </g>
            );
          })}

          {/* Historical line */}
          <motion.path
            d={historicalPath}
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="2"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5 }}
          />

          {/* Forecast line (dashed) */}
          {forecastPath && (
            <motion.path
              d={forecastPath}
              fill="none"
              stroke="url(#gradientForecast)"
              strokeWidth="2"
              strokeDasharray="4,4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 1.5 }}
            />
          )}

          {/* Data points */}
          {data.map((point, index) => {
            const x = getXPosition(index, data.length);
            const y = getYPosition(point.value);
            return (
              <motion.circle
                key={`historical-${index}`}
                cx={x}
                cy={y}
                r="2"
                fill="url(#gradient)"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 }}
              />
            );
          })}

          {/* Forecast points */}
          {forecastData.map((point, index) => {
            const x = getXPosition(data.length + index, allData.length);
            const y = getYPosition(point.value);
            return (
              <motion.circle
                key={`forecast-${index}`}
                cx={x}
                cy={y}
                r="2"
                fill="url(#gradientForecast)"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.5 + index * 0.1 }}
              />
            );
          })}

          {/* Annotations */}
          {annotations.map((annotation, index) => {
            const pointIndex = allData.findIndex(d => d.date === annotation.date);
            if (pointIndex === -1) return null;
            const x = getXPosition(pointIndex, allData.length);
            const y = getYPosition(annotation.value);
            return (
              <g key={`annotation-${index}`}>
                <line
                  x1={x}
                  y1={y - 10}
                  x2={x}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="1"
                  className="text-blue-500"
                />
                <circle
                  cx={x}
                  cy={y}
                  r="3"
                  fill="currentColor"
                  className="text-blue-500"
                />
                <text
                  x={x}
                  y={y - 15}
                  textAnchor="middle"
                  className="text-xs fill-blue-600 dark:fill-blue-400 font-medium"
                  fontSize="7"
                >
                  {annotation.label}
                </text>
              </g>
            );
          })}

          {/* Gradients */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
            <linearGradient id="gradientForecast" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6" />
            </linearGradient>
          </defs>

          {/* X-axis labels */}
          {data.map((point, index) => {
            if (index % Math.ceil(data.length / 6) !== 0 && index !== data.length - 1) return null;
            const x = getXPosition(index, data.length);
            return (
              <text
                key={`xlabel-${index}`}
                x={x}
                y={chartHeight + 15}
                textAnchor="middle"
                className="text-xs fill-gray-600 dark:fill-gray-400"
                fontSize="7"
              >
                {new Date(point.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </text>
            );
          })}
        </svg>

        {/* Legend */}
        <div className="absolute top-0 right-0 flex gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-0.5 bg-gradient-to-r from-red-500 to-orange-500"></div>
            <span className="text-gray-600 dark:text-gray-400">Historical</span>
          </div>
          {forecastData.length > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 border-dashed border-t-2"></div>
              <span className="text-gray-600 dark:text-gray-400">Forecast</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

