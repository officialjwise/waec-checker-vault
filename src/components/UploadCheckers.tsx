
import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UploadResult {
  inserted: number;
  skipped: number;
  errors: string[];
}

const UploadCheckers = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
      setUploadResult(null);
      
      // Parse CSV for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        const data = lines.slice(1, 6).map(line => {
          const values = line.split(',').map(v => v.trim());
          return headers.reduce((obj: any, header, index) => {
            obj[header] = values[index];
            return obj;
          }, {});
        });
        setPreviewData(data);
      };
      reader.readAsText(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    
    // Simulate upload process
    setTimeout(() => {
      const mockResult: UploadResult = {
        inserted: Math.floor(Math.random() * 400) + 100,
        skipped: Math.floor(Math.random() * 50),
        errors: Math.random() > 0.7 ? ['Row 15: Invalid PIN format', 'Row 23: Missing WAEC type'] : []
      };
      setUploadResult(mockResult);
      setUploading(false);
    }, 2000);
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewData([]);
    setUploadResult(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">CSV Upload Instructions</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• File must be in CSV format</li>
          <li>• Required headers: <code className="bg-blue-100 px-1 rounded">serial</code>, <code className="bg-blue-100 px-1 rounded">pin</code>, <code className="bg-blue-100 px-1 rounded">waec_type</code></li>
          <li>• WAEC types: BECE, WASSCE, NOVDEC</li>
          <li>• Duplicate serials will be skipped automatically</li>
        </ul>
      </div>

      {/* File Upload Area */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload WAEC Checkers</h2>
        
        {!selectedFile ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Choose CSV file</h3>
            <p className="text-gray-500 mb-4">Upload your WAEC checkers data</p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload">
              <Button className="cursor-pointer">
                Select CSV File
              </Button>
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Info */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">{selectedFile.name}</p>
                  <p className="text-sm text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={clearFile}>
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>

            {/* Preview */}
            {previewData.length > 0 && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Preview (first 5 rows)</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PIN</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">WAEC Type</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewData.map((row, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.serial}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.pin}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{row.waec_type}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Upload Button */}
            <div className="flex justify-end">
              <Button 
                onClick={handleUpload} 
                disabled={uploading}
                className="min-w-[120px]"
              >
                {uploading ? 'Uploading...' : 'Upload to Database'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Upload Result */}
      {uploadResult && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Result</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-semibold text-green-900">Inserted</p>
                <p className="text-2xl font-bold text-green-600">{uploadResult.inserted}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg">
              <AlertCircle className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="font-semibold text-yellow-900">Skipped</p>
                <p className="text-2xl font-bold text-yellow-600">{uploadResult.skipped}</p>
              </div>
            </div>
          </div>

          {uploadResult.errors.length > 0 && (
            <div className="p-4 bg-red-50 rounded-lg">
              <h4 className="font-semibold text-red-900 mb-2">Errors</h4>
              <ul className="text-sm text-red-800 space-y-1">
                {uploadResult.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadCheckers;
