import { Edit3 } from 'react-feather';

interface EditCounterProps {
  currentCount: number;
  maxCount?: number;
}

export default function EditCounter({ currentCount, maxCount = 50 }: EditCounterProps) {
  const percentage = (currentCount / maxCount) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <Edit3 size={18} />
          Edit Usage
        </h3>
        <span className={`text-sm font-medium ${
          isAtLimit ? 'text-red-600' : isNearLimit ? 'text-yellow-600' : 'text-gray-600'
        }`}>
          {currentCount} / {maxCount}
        </span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-blue-500'
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      
      {isNearLimit && !isAtLimit && (
        <p className="text-xs text-yellow-600 mt-2">
          You're approaching your edit limit
        </p>
      )}
      
      {isAtLimit && (
        <p className="text-xs text-red-600 mt-2">
          Edit limit reached. Upgrade for more edits.
        </p>
      )}
    </div>
  );
}