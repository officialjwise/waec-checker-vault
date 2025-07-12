
import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, X, AlertTriangle, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { adminApi, UploadResult } from '@/services/adminApi';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const UploadCheckers = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [allPreviewData, setAllPreviewData] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalRows, setTotalRows] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const itemsPerPage = 100;

  const validateFileType = (file: File): boolean => {
    const allowedTypes = ['text/csv', 'application/vnd.ms-excel'];
    const fileName = file.name.toLowerCase();
    return allowedTypes.includes(file.type) || fileName.endsWith('.csv');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('File selected:', file);
    
    if (!file) return;

    if (!validateFileType(file)) {
      setErrorMessage('Invalid file type. Please select a CSV file.');
      setShowErrorDialog(true);
      return;
    }

    setSelectedFile(file);
    setUploadResult(null);
    setPreviewData([]);
    setAllPreviewData([]);
    setCurrentPage(1);
    handlePreview(file);
  };

  const handleButtonClick = () => {
    console.log('Upload button clicked');
    fileInputRef.current?.click();
  };

  const handlePreview = async (file: File) => {
    try {
      setPreviewing(true);
      console.log('Previewing CSV file:', file.name);
      
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('File must contain at least a header row and one data row');
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const requiredHeaders = ['serial', 'pin', 'waec_type'];
      
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
      }

      const allRows = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        return {
          serial: values[headers.indexOf('serial')] || '',
          pin: values[headers.indexOf('pin')] || '',
          waec_type: values[headers.indexOf('waec_type')] || ''
        };
      });

      setAllPreviewData(allRows);
      setTotalRows(allRows.length);
      updatePreviewForPage(1, allRows);

      toast({
        title: "Preview Generated",
        description: `Loaded ${allRows.length} rows from CSV file.`,
      });
    } catch (error) {
      console.error('Error previewing file:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to preview CSV file. Please check the format.');
      setShowErrorDialog(true);
      clearFile();
    } finally {
      setPreviewing(false);
    }
  };

  const updatePreviewForPage = (page: number, data: any[]) => {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setPreviewData(data.slice(startIndex, endIndex));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updatePreviewForPage(page, allPreviewData);
  };

  const totalPages = Math.ceil(totalRows / itemsPerPage);

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    try {
      setUploading(true);
      console.log('Uploading CSV file:', selectedFile.name);
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      // Use the fixed endpoint
      const result = await adminApi.uploadCheckers(selectedFile);
      console.log('Upload result:', result);
      setUploadResult(result);
      
      toast({
        title: "Upload Successful!",
        description: `Successfully inserted ${result.inserted} checkers, skipped ${result.skipped} duplicates.`,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to upload checkers. Please try again.');
      setShowErrorDialog(true);
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setSelectedFile(null);
    setPreviewData([]);
    setAllPreviewData([]);
    setUploadResult(null);
    setCurrentPage(1);
    setTotalRows(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">CSV Upload Instructions</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• File must be in CSV format</li>
          <li>• Required headers: <code className="bg-blue-100 px-1 rounded">serial</code>, <code className="bg-blue-100 px-1 rounded">pin</code>, <code className="bg-blue-100 px-1 rounded">waec_type</code></li>
          <li>• WAEC types: BECE, WASSCE, NOVDEC, CSSPS, CTVET</li>
          <li>• Duplicate serials will be skipped automatically</li>
          <li>• Preview shows up to 100 rows per page</li>
        </ul>
      </div>

      {/* File Upload Area */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Upload WAEC Checkers</h2>
        
        {!selectedFile ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Choose CSV file</h3>
            <p className="text-gray-500 mb-4">Upload your WAEC checkers data</p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv,application/vnd.ms-excel"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <Button onClick={handleButtonClick} type="button">
              Select CSV File
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* File Info */}
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-green-500" />
                <div>
                  <p className="font-medium text-green-900">{selectedFile.name}</p>
                  <p className="text-sm text-green-700">
                    {(selectedFile.size / 1024).toFixed(1)} KB • {totalRows} rows
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={clearFile}>
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>

            {/* Preview Loading */}
            {previewing && (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Generating preview...</p>
              </div>
            )}

            {/* Preview with Pagination */}
            {previewData.length > 0 && !previewing && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-semibold text-gray-900">
                    Preview (showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalRows)} of {totalRows} rows)
                  </h3>
                  {totalPages > 1 && (
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <div className="overflow-x-auto max-h-96 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100 sticky top-0">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Serial</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">PIN</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">WAEC Type</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {previewData.map((row, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-900 font-mono">{row.serial}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 font-mono">{row.pin}</td>
                          <td className="px-4 py-2 text-sm">
                            <span className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                              {row.waec_type}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Upload Button */}
            {previewData.length > 0 && !previewing && (
              <div className="flex justify-end">
                <Button 
                  onClick={handleUpload} 
                  disabled={uploading}
                  className="min-w-[150px]"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Uploading...
                    </>
                  ) : (
                    'Upload to Database'
                  )}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Upload Result */}
      {uploadResult && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            Upload Completed Successfully
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-semibold text-green-900">Inserted</p>
                <p className="text-2xl font-bold text-green-600">{uploadResult.inserted}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertCircle className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="font-semibold text-yellow-900">Skipped</p>
                <p className="text-2xl font-bold text-yellow-600">{uploadResult.skipped}</p>
              </div>
            </div>
          </div>

          {uploadResult.errors.length > 0 && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-900 mb-2 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Errors Encountered
              </h4>
              <ul className="text-sm text-red-800 space-y-1">
                {uploadResult.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Error Dialog */}
      <AlertDialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Upload Error
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-700">
              {errorMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowErrorDialog(false)}>
              Understood
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UploadCheckers;
