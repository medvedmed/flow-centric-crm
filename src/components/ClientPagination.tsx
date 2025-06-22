
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface ClientPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export const ClientPagination: React.FC<ClientPaginationProps> = ({
  page,
  totalPages,
  onPageChange
}) => {
  if (totalPages <= 1) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="flex justify-center"
    >
      <Card className="border-0 bg-white/80 backdrop-blur-xl shadow-xl border border-white/20">
        <CardContent className="p-4">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 1}
              variant="outline"
              className="bg-white/50 border-gray-200 hover:bg-teal-50 hover:border-teal-300"
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600 px-4">
              Page {page} of {totalPages}
            </span>
            <Button
              onClick={() => onPageChange(page + 1)}
              disabled={page === totalPages}
              variant="outline"
              className="bg-white/50 border-gray-200 hover:bg-teal-50 hover:border-teal-300"
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
