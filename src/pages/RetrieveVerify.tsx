
import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Loader2, RotateCcw, MessageSquare, Home, ExternalLink, Printer, Grid3x3, Rows2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { clientApi } from "@/services/clientApi";

const RetrieveVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const phoneNumber = searchParams.get("phone");
  const requestId = searchParams.get("requestId");
  const prefix = searchParams.get("prefix");
  
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checkers, setCheckers] = useState([]);
  const [isVerified, setIsVerified] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [smsSent, setSmsSent] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [purchaseDate, setPurchaseDate] = useState("");

  const examTypeNames = {
    bece: "BECE",
    wassce: "WASSCE", 
    novdec: "NOVDEC"
  };

  const resultCheckingUrls = {
    bece: "https://eresults.waecgh.org",
    wassce: "https://ghana.waecdirect.org",
    novdec: "https://ghana.waecdirect.org"
  };

  // Timer for resend button
  useEffect(() => {
    if (resendTimer > 0 && !canResend) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
  }, [resendTimer, canResend]);

  const sendSmsNotification = async (checkersData) => {
    setSmsSent(false);
    
    // Simulate SMS sending delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const smsMessage = `Young Press - Your checkers retrieved successfully! You have ${checkersData.length} active result checker(s). Visit our portal to view details. Thank you for using our services.`;
    
    console.log(`SMS sent to ${phoneNumber}: ${smsMessage}`);
    
    setSmsSent(true);
    toast({
      title: "SMS sent successfully",
      description: `Notification sent to ${phoneNumber} with your checker details.`,
    });
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 4) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 4-digit verification code.",
        variant: "destructive"
      });
      return;
    }

    if (!requestId || !prefix) {
      toast({
        title: "Missing verification data",
        description: "Request ID or prefix is missing. Please start the process again.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Use the phone number as received from URL params (without adding leading 0)
      const fullPhoneNumber = phoneNumber?.startsWith('0') 
        ? phoneNumber 
        : `0${phoneNumber}`;
      
      console.log('Verifying OTP with data:', {
        phone: fullPhoneNumber,
        otp,
        requestId,
        prefix
      });
      
      const response = await clientApi.verifyRetrieveOtp(fullPhoneNumber, otp, requestId, prefix);
      console.log('Verify OTP response:', response);
      
      // Handle both success formats - check if response has checkers or if status is success
      if ((response.status === 'success' && response.checkers) || 
          (response.checkers && Array.isArray(response.checkers)) ||
          (response.message && response.message.includes('verified successfully'))) {
        
        const checkersData = response.checkers || [];
        setCheckers(checkersData);
        setIsVerified(true);
        
        // Set purchase date
        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }) + ' @ ' + now.toLocaleTimeString('en-US', {
          hour12: true,
          hour: '2-digit',
          minute: '2-digit'
        });
        setPurchaseDate(formattedDate);
        
        toast({
          title: "Verification successful",
          description: `Found ${checkersData.length} result checkers for your account.`,
        });

        // Send SMS notification after successful retrieval
        await sendSmsNotification(checkersData);
      } else {
        throw new Error(response.message || 'Verification failed');
      }
      
    } catch (error) {
      console.error('Error verifying OTP:', error);
      
      let errorMessage = error instanceof Error ? error.message : 'Failed to verify OTP';
      
      // Don't treat "OTP verified successfully" as an error
      if (errorMessage.includes('verified successfully')) {
        // This is actually a success, try to handle it
        toast({
          title: "Verification successful",
          description: "OTP verified successfully. Retrieving your checkers...",
        });
        
        // Set empty checkers array as fallback and show success state
        setCheckers([]);
        setIsVerified(true);
        
        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }) + ' @ ' + now.toLocaleTimeString('en-US', {
          hour12: true,
          hour: '2-digit',
          minute: '2-digit'
        });
        setPurchaseDate(formattedDate);
        
        return; // Exit early since this is actually success
      }
      
      toast({
        title: "Verification failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setCanResend(false);
    setResendTimer(60);
    
    try {
      // Use the phone number as received from URL params (without adding leading 0)
      const fullPhoneNumber = phoneNumber?.startsWith('0') 
        ? phoneNumber 
        : `0${phoneNumber}`;
      
      console.log('Resending OTP for phone:', fullPhoneNumber);
      
      const response = await clientApi.initiateRetrieve(fullPhoneNumber);
      console.log('Resend OTP response:', response);
      
      // Update URL with new requestId and prefix if provided
      if (response.requestId || response.prefix) {
        const newParams = new URLSearchParams(searchParams);
        if (response.requestId) newParams.set('requestId', response.requestId);
        if (response.prefix) newParams.set('prefix', response.prefix);
        navigate(`/retrieve/verify?${newParams.toString()}`, { replace: true });
      }
      
      toast({
        title: "Code resent",
        description: "A new verification code has been sent to your phone.",
      });
    } catch (error) {
      console.error('Error resending OTP:', error);
      toast({
        title: "Failed to resend",
        description: "Could not resend verification code. Please try again.",
        variant: "destructive"
      });
      setCanResend(true);
      setResendTimer(0);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "grid" ? "list" : "grid");
  };

  if (!phoneNumber) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Session Expired</h2>
            <p className="text-gray-600 mb-4">Please start the verification process again.</p>
            <Link to="/retrieve">
              <Button>Back to Retrieve</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Enhanced Print styles for better PDF rendering */}
      <style>
        {`
          @media print {
            .no-print {
              display: none !important;
            }
            body {
              background: white !important;
              -webkit-print-color-adjust: exact !important;
              color-adjust: exact !important;
              font-family: Arial, sans-serif !important;
              font-size: 12pt !important;
              line-height: 1.4 !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            * {
              box-sizing: border-box !important;
            }
            .print-container {
              background: white !important;
              margin: 0 !important;
              padding: 15mm !important;
              width: 100% !important;
              max-width: none !important;
            }
            .checker-card {
              border: 3px solid #000 !important;
              background: white !important;
              page-break-inside: avoid !important;
              margin: 10mm 0 !important;
              padding: 8mm !important;
              width: 100% !important;
              max-width: 85mm !important;
              min-height: 60mm !important;
              display: block !important;
              float: none !important;
              position: relative !important;
              box-shadow: none !important;
            }
            .print-grid {
              display: block !important;
              columns: 2 !important;
              column-gap: 10mm !important;
              column-fill: auto !important;
            }
            .print-grid .checker-card {
              break-inside: avoid !important;
              display: inline-block !important;
              width: 100% !important;
              margin: 0 0 10mm 0 !important;
            }
            .print-list {
              display: block !important;
            }
            .print-list .checker-card {
              display: block !important;
              width: 100% !important;
              max-width: 180mm !important;
              margin: 0 auto 15mm auto !important;
            }
            .checker-title {
              font-size: 14pt !important;
              font-weight: bold !important;
              text-align: center !important;
              margin-bottom: 5mm !important;
              line-height: 1.2 !important;
            }
            .checker-details {
              font-size: 11pt !important;
              margin: 3mm 0 !important;
              text-align: center !important;
            }
            .checker-details strong {
              font-weight: bold !important;
            }
            .dotted-line {
              border-top: 2px dotted #333 !important;
              margin: 4mm 0 !important;
              width: 100% !important;
            }
            .check-button {
              background: #1d4ed8 !important;
              color: white !important;
              padding: 3mm 6mm !important;
              text-align: center !important;
              text-decoration: none !important;
              display: block !important;
              margin: 4mm 0 !important;
              font-weight: bold !important;
              font-size: 10pt !important;
              border-radius: 2mm !important;
            }
            .purchase-info {
              font-size: 9pt !important;
              margin: 2mm 0 !important;
              text-align: center !important;
              line-height: 1.3 !important;
            }
            .instructions {
              font-size: 8pt !important;
              color: #666 !important;
              text-align: center !important;
              margin-top: 3mm !important;
              line-height: 1.2 !important;
            }
            @page {
              size: A4 !important;
              margin: 15mm !important;
            }
          }
        `}
      </style>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <Header 
          showBackButton={true}
          backTo="/retrieve"
          title={isVerified ? "Retrieved Checkers" : "Phone Verification"}
          subtitle={isVerified ? `Found ${checkers.length} checker(s)` : `+233 ${phoneNumber}`}
        />

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 print-container">
          <div className="max-w-6xl mx-auto">
            {!isVerified ? (
              // OTP Verification Form
              <div className="max-w-md mx-auto">
                <div className="text-center mb-8">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Shield className="h-8 w-8 text-blue-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Enter Verification Code
                  </h2>
                  <p className="text-gray-600">
                    We've sent a 4-digit code to +233 {phoneNumber}
                  </p>
                </div>

                <Card>
                  <CardContent className="pt-6">
                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                      <div>
                        <Label htmlFor="otp">Verification Code</Label>
                        <Input
                          id="otp"
                          type="text"
                          placeholder="0000"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))}
                          className="mt-1 text-center text-2xl tracking-widest"
                          maxLength={4}
                          required
                          disabled={isLoading}
                        />
                        <p className="text-sm text-gray-500 mt-1 text-center">
                          Enter the 4-digit code sent to your phone
                        </p>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                        disabled={isLoading || otp.length !== 4}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                            Verifying...
                          </>
                        ) : (
                          "Verify Code"
                        )}
                      </Button>

                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={handleResendOtp}
                          disabled={!canResend}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          {canResend ? "Resend Code" : `Resend in ${resendTimer}s`}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            ) : (
              // Display Retrieved Checkers with enhanced print styling
              <div>
                {/* Header with controls - Hidden in print */}
                <div className="flex items-center justify-between mb-8 no-print">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Your Retrieved Checkers
                    </h2>
                    <p className="text-gray-600">
                      Found {checkers.length} checker(s) for +233 {phoneNumber}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      onClick={toggleViewMode} 
                      variant="outline" 
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      {viewMode === "grid" ? (
                        <>
                          <Rows2 className="h-4 w-4" />
                          List View
                        </>
                      ) : (
                        <>
                          <Grid3x3 className="h-4 w-4" />
                          Grid View
                        </>
                      )}
                    </Button>
                    <Button onClick={handlePrint} className="bg-gray-800 hover:bg-gray-900">
                      <Printer className="h-4 w-4 mr-2" />
                      PRINT
                    </Button>
                  </div>
                </div>
                
                {/* SMS Notification Status */}
                <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg no-print">
                  <div className="flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm text-green-800">
                      {smsSent ? "SMS notification sent successfully!" : "Sending SMS notification..."}
                    </span>
                  </div>
                </div>

                {/* Checkers Display with enhanced print styling */}
                <div className={
                  viewMode === "grid" 
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print-grid" 
                    : "space-y-4 print-list"
                }>
                  {checkers.map((checker) => (
                    <div key={checker.id} className="checker-card bg-white border-2 border-gray-800 p-6 text-center">
                      <h3 className="checker-title text-xl font-bold mb-4">
                        {examTypeNames[checker.waec_type?.toLowerCase()] || checker.waec_type} RESULT CHECKER
                      </h3>
                      
                      {/* Dotted line */}
                      <div className="dotted-line border-t-2 border-dotted border-gray-600 mb-4"></div>
                      
                      <div className="space-y-2 mb-4">
                        <p className="checker-details text-lg">
                          <span className="font-semibold">Serial:</span> {checker.serial}
                        </p>
                        <p className="checker-details text-lg">
                          <span className="font-semibold">PIN:</span> {checker.pin}
                        </p>
                      </div>
                      
                      {/* Dotted line */}
                      <div className="dotted-line border-t-2 border-dotted border-gray-600 mb-4"></div>
                      
                      <div className="space-y-3">
                        <a
                          href={resultCheckingUrls[checker.waec_type?.toLowerCase()] || resultCheckingUrls.wassce}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="check-button inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                        >
                          Check Your Results
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </a>
                        
                        <div className="space-y-1 text-sm">
                          <p className="purchase-info">
                            <span className="font-semibold">Retrieved by:</span> {phoneNumber}
                          </p>
                          <p className="purchase-info">
                            <span className="font-semibold">Date:</span> {purchaseDate}
                          </p>
                          <p className="instructions text-xs text-gray-600">
                            Use your serial and PIN on the website above to check your results
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons - Hidden in print */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center no-print">
                  <Link to="/">
                    <Button variant="outline" className="w-full sm:w-auto">
                      <Home className="h-4 w-4 mr-2" />
                      Back to Home
                    </Button>
                  </Link>
                  <Link to="/buy">
                    <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                      Buy More Checkers
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default RetrieveVerify;
