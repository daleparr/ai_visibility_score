import { motion } from 'framer-motion';

interface DetailedMetricCardProps {
  name: string;
  score: number;
  grade: string;
  status: string;
}

const getGradeColor = (grade: string) => {
  switch (grade) {
    case 'A': return '#5a7359'; // sage
    case 'B': return '#d4a574'; // champagne
    case 'C': return '#c97a5a'; // terracotta
    case 'D': return '#a86449'; // darker terracotta
    case 'F': return '#8b4049'; // burgundy
    default: return '#78716c'; // warm-500
  }
};

const getProgressColor = (grade: string) => {
  switch (grade) {
    case 'A': return '#5a7359'; // sage
    case 'B': return '#d4a574'; // champagne
    case 'C': return '#c97a5a'; // terracotta
    case 'D': return '#a86449'; // darker terracotta
    case 'F': return '#8b4049'; // burgundy
    default: return '#78716c'; // warm-500
  }
};

const getStatusIndicator = (grade: string) => {
  switch (grade) {
    case 'A': return '#5a7359'; // sage
    case 'B': return '#d4a574'; // champagne
    case 'C': return '#c97a5a'; // terracotta
    case 'D': return '#a86449'; // darker terracotta
    case 'F': return '#8b4049'; // burgundy
    default: return '#a8a29e'; // warm-400
  }
};

export function DetailedMetricCard({ name, score, grade, status }: DetailedMetricCardProps) {
  return (
    <motion.div 
      className="bg-white border rounded-lg p-6 hover:shadow-sm transition-all"
      style={{ borderColor: '#e7e5e4' }}
      whileHover={{ borderColor: '#d6d3d1' }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between mb-4">
        <h3 
          className="text-sm pr-4"
          style={{ 
            color: '#44403c',
            fontWeight: 500,
            letterSpacing: '0.01em'
          }}
        >
          {name.replace(/_/g, ' ')}
        </h3>
        <div className="flex flex-col items-end gap-2">
          <div 
            style={{ 
              fontSize: '2.625rem', 
              color: '#1c1917',
              fontWeight: 600,
              letterSpacing: '-0.02em',
              lineHeight: 1,
              fontFamily: 'Georgia, serif'
            }}
          >
            {score}
          </div>
          <div 
            className="px-3 py-1 rounded text-white text-xs uppercase tracking-wider"
            style={{ 
              backgroundColor: getGradeColor(grade),
              fontWeight: 600
            }}
          >
            Grade {grade}
          </div>
        </div>
      </div>
      
      <div className="w-full rounded-full h-1.5 mb-4 overflow-hidden" style={{ backgroundColor: '#f5f5f4' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: getProgressColor(grade) }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
        />
      </div>
      
      <div className="flex items-start gap-2">
        <div 
          className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
          style={{ backgroundColor: getStatusIndicator(grade) }}
        />
        <p className="text-xs" style={{ color: '#57534e', lineHeight: 1.5 }}>
          {status}
        </p>
      </div>
    </motion.div>
  );
}
