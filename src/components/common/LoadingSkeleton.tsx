import React from 'react';
import { Box, Skeleton, useTheme } from '@mui/material';
import { motion } from 'framer-motion';

interface LoadingSkeletonProps {
  variant?: 'calendar' | 'metrics' | 'chart';
  rows?: number;
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  variant = 'calendar', 
  rows = 6 
}) => {
  const theme = useTheme();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  if (variant === 'calendar') {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: theme.spacing(1),
          padding: theme.spacing(2),
        }}
      >
        {/* Day headers */}
        {Array.from({ length: 7 }).map((_, index) => (
          <motion.div key={`header-${index}`} variants={itemVariants}>
            <Skeleton
              variant="text"
              width="100%"
              height={32}
              sx={{ borderRadius: 1 }}
            />
          </motion.div>
        ))}
        
        {/* Calendar cells */}
        {Array.from({ length: 42 }).map((_, index) => (
          <motion.div key={`cell-${index}`} variants={itemVariants}>
            <Skeleton
              variant="circular"
              width="100%"
              height="100%"
              sx={{ aspectRatio: '1 / 1' }}
            />
          </motion.div>
        ))}
      </motion.div>
    );
  }

  if (variant === 'metrics') {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ padding: theme.spacing(2) }}
      >
        <motion.div variants={itemVariants}>
          <Skeleton variant="text" width="60%" height={32} sx={{ mb: 2 }} />
        </motion.div>
        
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
          {Array.from({ length: 6 }).map((_, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Skeleton variant="text" width="40%" height={20} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="80%" height={24} />
            </motion.div>
          ))}
        </Box>
        
        <motion.div variants={itemVariants} style={{ marginTop: theme.spacing(2) }}>
          <Skeleton variant="rectangular" width="100%" height={120} sx={{ borderRadius: 1 }} />
        </motion.div>
      </motion.div>
    );
  }

  if (variant === 'chart') {
    return (
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ padding: theme.spacing(2) }}
      >
        <motion.div variants={itemVariants}>
          <Skeleton variant="text" width="50%" height={28} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="70%" height={20} sx={{ mb: 3 }} />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <Skeleton 
            variant="rectangular" 
            width="100%" 
            height={300} 
            sx={{ borderRadius: 2 }} 
          />
        </motion.div>
      </motion.div>
    );
  }

  return null;
};

export default LoadingSkeleton; 