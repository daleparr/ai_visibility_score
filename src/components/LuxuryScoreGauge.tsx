import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface LuxuryScoreGaugeProps {
  score: number;
  grade: string;
  impactLevel?: string;
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

export function LuxuryScoreGauge({ score, grade, impactLevel = 'MEDIUM IMPACT' }: LuxuryScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimatedScore(score), 300);
    return () => clearTimeout(timer);
  }, [score]);

  const circumference = 2 * Math.PI * 115;
  const offset = circumference - (animatedScore / 100) * circumference;

  return (
    <div className="relative w-80 h-80 mx-auto">
      <svg className="transform -rotate-90 w-full h-full filter drop-shadow-sm" viewBox="0 0 280 280">
        {/* Background ring - very subtle */}
        <circle
          cx="140"
          cy="140"
          r="115"
          stroke="#f5f5f4"
          strokeWidth="12"
          fill="none"
        />
        {/* Progress ring - refined stroke */}
        <motion.circle
          cx="140"
          cy="140"
          r="115"
          stroke={getGradeColor(grade)}
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-xs uppercase tracking-widest mb-4" style={{ color: '#a8a29e', fontWeight: 300, letterSpacing: '0.15em' }}>
          AIDI Score
        </div>
        <motion.div
          className="mb-2"
          style={{ 
            fontSize: '5rem', 
            fontWeight: 300,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            color: '#1c1917',
            fontFamily: 'Georgia, serif'
          }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {Math.round(animatedScore)}
        </motion.div>
        <div className="text-sm mb-6" style={{ color: '#a8a29e', fontWeight: 300 }}>/100</div>
        <div 
          className="px-6 py-2 rounded-full text-white text-xs uppercase tracking-widest"
          style={{ 
            backgroundColor: getGradeColor(grade),
            fontWeight: 500,
            letterSpacing: '0.15em'
          }}
        >
          Grade {grade}
        </div>
        <div className="text-xs mt-3 uppercase tracking-widest" style={{ color: '#d6d3d1', fontWeight: 300, letterSpacing: '0.12em' }}>
          {impactLevel}
        </div>
      </div>
    </div>
  );
}
