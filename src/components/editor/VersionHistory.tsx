import { Clock, RotateCcw } from 'react-feather';
import { ResumeVersion } from '@/types/resume.types';
import { formatDistanceToNow } from '@/utils/date.utils';

interface VersionHistoryProps {
  versions: ResumeVersion[];
  currentVersionId: string | null;
  onVersionSelect: (versionId: string) => void;
  isLoading: boolean;
}

export default function VersionHistory({
  versions,
  currentVersionId,
  onVersionSelect,
  isLoading,
}: VersionHistoryProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock size={18} />
          Version History
        </h3>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Clock size={18} />
        Version History
      </h3>
      
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {versions.slice().reverse().map((version) => {
          const isActive = version.id === currentVersionId;
          
          return (
            <div
              key={version.id}
              className={`p-3 rounded-lg border transition-all cursor-pointer ${
                isActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => !isActive && onVersionSelect(version.id)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-sm">
                    Version {version.version}
                    {isActive && (
                      <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(version.createdAt)} ago
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {version.editCount} edits
                  </div>
                </div>
                
                {!isActive && (
                  <button
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Revert to this version"
                  >
                    <RotateCcw size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}