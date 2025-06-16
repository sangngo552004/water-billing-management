import React from 'react';
import { Loader2 } from 'lucide-react'; // Assuming you have lucide-react installed

export const Spinner = ({ size = 'md', className = '' }) => {
  let spinnerSize = 'h-5 w-5';
  if (size === 'sm') spinnerSize = 'h-4 w-4';
  if (size === 'lg') spinnerSize = 'h-8 w-8';
  if (size === 'xl') spinnerSize = 'h-12 w-12';

  return (
    <Loader2 className={`animate-spin text-blue-500 ${spinnerSize} ${className}`} />
  );
};