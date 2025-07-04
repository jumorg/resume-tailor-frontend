import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Alert } from '@/components/common/Alert';
import { Button } from '@/components/common/Button';

export const TailoringPage: React.FC = () => {
  const { tailoringId } = useParams<{ tailoringId: string }>();
  const navigate = useNavigate();

  // TODO: In Step 5, this will display the actual tailored resume
  // For now, just show a success message

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Resume Tailored Successfully!</h2>
          <p className="mt-2 text-gray-600">
            Your resume has been tailored to match the job description.
          </p>
        </div>

        <Alert type="success" title="Tailoring Complete">
          Your resume has been successfully tailored. In the next step, you'll be able to view 
          and edit the tailored content.
        </Alert>

        <div className="mt-6 flex gap-4">
          <Button onClick={() => navigate('/dashboard')}>
            Upload Another Resume
          </Button>
          <Button variant="outline" onClick={() => console.log('View tailored resume:', tailoringId)}>
            View Tailored Resume (Coming in Step 5)
          </Button>
        </div>
      </div>
    </DashboardLayout>
  );
};