import { motion } from 'motion/react';

interface LuxuryMetricCardProps {
  name: string;
  score: number;
  grade: string;
  status: string;
}

const getGradeColor = (grade: string) => {
  switch (grade) {
    case 'A': return '#5a7359';
    case 'B': return '#d4a574';
    case 'C': return '#c97a5a';
    case 'D': return '#a86449';
    case 'F': return '#8b4049';
    default: return '#78716c';
  }
};

export function LuxuryMetricCard({ name, score, grade, status }: LuxuryMetricCardProps) {
  return (
    <motion.div 
      className="bg-white rounded-xl p-8 hover:shadow-lg transition-all"
      style={{ 
        border: '1px solid #e7e5e4',
        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.05)'
      }}
      whileHover={{ 
        boxShadow: '0 12px 24px -4px rgb(0 0 0 / 0.1), 0 4px 8px -4px rgb(0 0 0 / 0.06)',
        y: -2
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <h3 
        className="text-sm mb-6"
        style={{ 
          color: '#78716c',
          fontWeight: 400,
          letterSpacing: '0.02em',
          lineHeight: 1.4
        }}
      >
        {name.replace(/_/g, ' ').split(' ').map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ')}
      </h3>
      
      <div className="flex items-end gap-2 mb-6">
        <div 
          style={{ 
            fontSize: '3.5rem',
            fontWeight: 300,
            letterSpacing: '-0.03em',
            lineHeight: 1,
            color: '#1c1917',
            fontFamily: 'Georgia, serif'
          }}
        >
          {score}
        </div>
      </div>
      
      <div className="w-full rounded-full h-1 mb-6 overflow-hidden" style={{ backgroundColor: '#f5f5f4' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: getGradeColor(grade) }}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
      
      <div className="flex items-center justify-between">
        <div 
          className="px-4 py-1.5 rounded-full text-white text-xs uppercase tracking-wider"
          style={{ 
            backgroundColor: getGradeColor(grade),
            fontWeight: 500,
            letterSpacing: '0.12em'
          }}
        >
          Grade {grade}
        </div>
        <div 
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: getGradeColor(grade) }}
        />
      </div>
      
      <p className="text-xs mt-4" style={{ color: '#a8a29e', lineHeight: 1.6, fontWeight: 300 }}>
        {status}
      </p>
    </motion.div>
  );
}
