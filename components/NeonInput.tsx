
import React from 'react';

interface NeonInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

const NeonInput: React.FC<NeonInputProps> = ({ label, className, ...props }) => {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="text-[#39FF14] text-xs uppercase font-bold tracking-tighter">{label}</label>}
      <input 
        className={`bg-black border border-[#39FF14] text-[#39FF14] px-4 py-2 focus:outline-none focus:shadow-[0_0_10px_#39FF14] transition-all placeholder:text-[#39FF14]/30 ${className}`}
        {...props}
      />
    </div>
  );
};

export default NeonInput;
