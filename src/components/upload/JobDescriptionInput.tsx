import React, { useState } from 'react';

interface JobDescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
}

const MAX_LENGTH = 10000;

export const JobDescriptionInput: React.FC<JobDescriptionInputProps> = ({
  value,
  onChange,
  error,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const remaining = MAX_LENGTH - value.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label htmlFor="job-description" className="block text-sm font-medium text-gray-700">
          Job Description
          <span className="text-red-500 ml-1">*</span>
        </label>
        <span
          className={`text-xs ${
            remaining < 100 ? 'text-red-500' : 'text-gray-500'
          }`}
        >
          {remaining.toLocaleString()} characters remaining
        </span>
      </div>
      
      <div className={`relative ${isFocused ? 'ring-2 ring-primary-500 rounded-md' : ''}`}>
        <textarea
          id="job-description"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          maxLength={MAX_LENGTH}
          rows={8}
          className={`
            block w-full rounded-md shadow-sm
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
            }
            sm:text-sm resize-none
          `}
          placeholder="Paste the job description here..."
          aria-describedby={error ? 'job-description-error' : undefined}
        />
      </div>
      
      {error && (
        <p id="job-description-error" className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};