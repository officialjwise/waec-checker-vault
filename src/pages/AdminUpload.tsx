
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';

const AdminUpload = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadComplete(true);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const recentUploads = [
    {
      id: 1,
      filename: 'waec_results_2024_may.csv',
      status: 'success',
      records: 15420,
      date: '2024-06-08 10:30',
    },
    {
      id: 2,
      filename: 'waec_results_2024_nov.csv',
      status: 'success',
      records: 18653,
      date: '2024-06-07 14:15',
    },
    {
      id: 3,
      filename: 'waec_results_2023_may.csv',
      status: 'error',
      records: 0,
      date: '2024-06-06 09:20',
      error: 'Invalid format',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        
        <div className="flex-1 lg:ml-64 p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-foreground">CSV Upload</h1>
              <p className="text-muted-foreground">Upload WAEC result data files</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Upload Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Upload New File
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleFileUpload} className="space-y-6">
                    <div>
                      <Label htmlFor="examType">Exam Type</Label>
                      <select className="w-full mt-1 p-2 border rounded-md">
                        <option value="ssce">SSCE</option>
                        <option value="gce">GCE</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="examYear">Exam Year</Label>
                      <Input
                        id="examYear"
                        type="number"
                        placeholder="2024"
                        min="2000"
                        max="2030"
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="examSession">Session</Label>
                      <select className="w-full mt-1 p-2 border rounded-md">
                        <option value="may-june">May/June</option>
                        <option value="nov-dec">Nov/Dec</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="csvFile">CSV File</Label>
                      <Input
                        id="csvFile"
                        type="file"
                        accept=".csv"
                        required
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Only CSV files are accepted. Max size: 50MB
                      </p>
                    </div>

                    {isUploading && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} />
                      </div>
                    )}

                    {uploadComplete && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span>Upload completed successfully!</span>
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isUploading}
                    >
                      {isUploading ? 'Uploading...' : 'Upload File'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Recent Uploads */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Recent Uploads
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentUploads.map((upload) => (
                      <div key={upload.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{upload.filename}</h4>
                            <div className="text-sm text-muted-foreground mt-1">
                              {upload.date}
                            </div>
                            {upload.status === 'success' && (
                              <div className="text-sm text-green-600 mt-1">
                                {upload.records.toLocaleString()} records processed
                              </div>
                            )}
                            {upload.status === 'error' && (
                              <div className="text-sm text-red-600 mt-1">
                                Error: {upload.error}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            {upload.status === 'success' ? (
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-red-600" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Upload Instructions */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle>CSV Format Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <h4>Required CSV Columns:</h4>
                  <ul>
                    <li><strong>exam_number:</strong> Student's examination number</li>
                    <li><strong>student_name:</strong> Full name of the student</li>
                    <li><strong>center_number:</strong> Examination center number</li>
                    <li><strong>center_name:</strong> Name of examination center</li>
                    <li><strong>subject_code:</strong> Subject code (e.g., ENG, MATH)</li>
                    <li><strong>subject_name:</strong> Subject name</li>
                    <li><strong>grade:</strong> Grade obtained (A1, B2, C4, etc.)</li>
                    <li><strong>exam_year:</strong> Year of examination</li>
                    <li><strong>exam_session:</strong> Session (May/June or Nov/Dec)</li>
                  </ul>
                  
                  <h4>Notes:</h4>
                  <ul>
                    <li>Each row should represent one subject result for one student</li>
                    <li>Students with multiple subjects should have multiple rows</li>
                    <li>File encoding should be UTF-8</li>
                    <li>Maximum file size: 50MB</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUpload;
