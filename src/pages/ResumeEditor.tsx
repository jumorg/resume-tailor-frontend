import { Link } from 'react-router-dom';
import { ArrowLeft, Download, RotateCcw } from 'react-feather';
import { useResumeEditor } from '@/hooks/useResumeEditor';
import { AppHeader } from '@/components/layout/AppHeader';
import ResumeCanvas from '@/components/editor/ResumeCanvas';
import VersionHistory from '@/components/editor/VersionHistory';
import EditCounter from '@/components/editor/EditCounter';

export default function ResumeEditor() {
  const {
    resumeContent,
    versions,
    isLoading,
    error,
    editHistory,
    selectedSectionId,
    isProcessing,
    editCount,
    handleSectionSelect,
    handleEditSubmit,
    handleVersionSelect,
    handleUndo,
  } = useResumeEditor();

  if (isLoading && !resumeContent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading resume...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AppHeader />
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
            <Link
              to="/dashboard"
              className="mt-4 inline-block text-blue-600 hover:text-blue-700"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      {/* Editor Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-xl font-semibold text-gray-900">Resume Editor</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleUndo}
              disabled={editHistory.length === 0 || isProcessing}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <RotateCcw size={18} />
              Undo
            </button>
            
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Download size={18} />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Main Editor Layout */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resume Canvas - Main Area */}
          <div className="lg:col-span-2">
            {resumeContent && (
              <ResumeCanvas
                sections={resumeContent.sections}
                selectedSectionId={selectedSectionId}
                isProcessing={isProcessing}
                onSectionSelect={handleSectionSelect}
                onEditSubmit={handleEditSubmit}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Edit Counter */}
            <EditCounter currentCount={editCount} />
            
            {/* Version History */}
            <VersionHistory
              versions={versions}
              currentVersionId={resumeContent?.id || null}
              onVersionSelect={handleVersionSelect}
              isLoading={isLoading}
            />
            
            {/* Instructions */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">How to Edit</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Click any editable section to select it</li>
                <li>• Highlight specific text to edit portions</li>
                <li>• Use quick actions or custom prompts</li>
                <li>• All changes are automatically saved</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}