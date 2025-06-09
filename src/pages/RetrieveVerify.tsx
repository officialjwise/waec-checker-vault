
import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Loader2, Copy, Eye, EyeOff, RotateCcw, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";

const RetrieveVerify = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const phoneNumber = searchParams.get("phone");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [checkers, setCheckers] = useState([]);
  const [isVerified, setIsVerified] = useState(false);
  const [showPins, setShowPins] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [smsSent, setSmsSent] = useState(false);

  // Auto-fill OTP for test number
  useEffect(() => {
    if (phoneNumber === "0543482189") {
      setOtp("123456");
    }
  }, [phoneNumber]);

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
    
    if (otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the 6-digit verification code.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate OTP verification
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if it's our test number with correct OTP or simulate verification
    const isTestNumber = phoneNumber === "0543482189" && otp === "123456";
    const success = isTestNumber || Math.random() > 0.1;
    
    if (success) {
      // Generate specific checkers for test number or mock checkers for others
      let mockCheckers;
      
      if (isTestNumber) {
        mockCheckers = [
          {
            id: 1,
            waecType: "wassce",
            serial: "WASSCE202400543",
            pin: "YP543ABC",
            purchaseDate: "2024-01-15",
            status: "active"
          },
          {
            id: 2,
            waecType: "bece",
            serial: "BECE202400482",
            pin: "YP482DEF",
            purchaseDate: "2024-02-10",
            status: "active"
          }
        ];
      } else {
        mockCheckers = [
          {
            id: 1,
            waecType: "wassce",
            serial: "WASSCE202400123",
            pin: "ABC12345",
            purchaseDate: "2024-01-15",
            status: "active"
          },
          {
            id: 2,
            waecType: "bece",
            serial: "BECE202400456",
            pin: "DEF67890",
            purchaseDate: "2024-02-10",
            status: "active"
          }
        ];
      }
      
      setCheckers(mockCheckers);
      setIsVerified(true);
      
      toast({
        title: "Verification successful",
        description: `Found ${mockCheckers.length} result checkers for your account.`,
      });

      // Send SMS notification after successful retrieval
      await sendSmsNotification(mockCheckers);
    } else {
      toast({
        title: "Invalid verification code",
        description: "The code you entered is incorrect. Please try again.",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
  };

  const handleResendOtp = async () => {
    setCanResend(false);
    setResendTimer(60);
    
    // Simulate resend OTP
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Auto-fill for test number again
    if (phoneNumber === "0543482189") {
      setOtp("123456");
    }
    
    toast({
      title: "Code resent",
      description: "A new verification code has been sent to your phone.",
    });
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
    });
  };

  const copyAllCheckers = () => {
    const allCheckers = checkers.map(checker => 
      `${checker.waecType.toUpperCase()} - Serial: ${checker.serial}, PIN: ${checker.pin}`
    ).join('\n');
    
    navigator.clipboard.writeText(allCheckers);
    toast({
      title: "All checkers copied!",
      description: "All your result checkers copied to clipboard",
    });
  };

  const examTypeNames = {
    bece: "BECE",
    wassce: "WASSCE", 
    novdec: "NOVDEC"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header 
        showBackButton={true}
        backTo="/retrieve"
        title="Phone Verification"
        subtitle={`+233 ${phoneNumber}`}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {!isVerified ? (
            // OTP Verification Form
            <div>
              <div className="text-center mb-8">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Enter Verification Code
                </h2>
                <p className="text-gray-600">
                  We've sent a 6-digit code to +233 {phoneNumber}
                </p>
                {phoneNumber === "0543482189" && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Demo mode: OTP auto-filled as <strong>123456</strong>
                    </p>
                  </div>
                )}
              </div>

              <Card>
                <CardContent className="pt-6">
                  <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <div>
                      <Label htmlFor="otp">Verification Code</Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="000000"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="mt-1 text-center text-2xl tracking-widest"
                        maxLength={6}
                        required
                        disabled={isLoading}
                      />
                      <p className="text-sm text-gray-500 mt-1 text-center">
                        Enter the 6-digit code sent to your phone
                      </p>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3"
                      disabled={isLoading || otp.length !== 6}
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
            // Display Retrieved Checkers
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Your Result Checkers
                </h2>
                <p className="text-gray-600">
                  Found {checkers.length} checker(s) for +233 {phoneNumber}
                </p>
                
                {/* SMS Notification Status */}
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-sm text-green-800">
                      {smsSent ? "SMS notification sent successfully!" : "Sending SMS notification..."}
                    </span>
                  </div>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>Your Checkers ({checkers.length})</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowPins(!showPins)}
                      >
                        {showPins ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                        {showPins ? "Hide" : "Show"} PINs
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={copyAllCheckers}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy All
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {checkers.map((checker) => (
                      <div key={checker.id} className="bg-gray-50 p-4 rounded-lg border">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h3 className="font-semibold text-lg text-gray-900">
                              {examTypeNames[checker.waecType]} Result Checker
                            </h3>
                            <p className="text-sm text-gray-500">
                              Purchased: {new Date(checker.purchaseDate).toLocaleDateString()}
                            </p>
                          </div>
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                            {checker.status}
                          </span>
                        </div>
                        
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-gray-600">Serial Number</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <code className="bg-white px-3 py-2 rounded border font-mono text-sm flex-1">
                                {checker.serial}
                              </code>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(checker.serial, "Serial number")}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-gray-600">PIN</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <code className="bg-white px-3 py-2 rounded border font-mono text-sm flex-1">
                                {showPins ? checker.pin : "••••••••"}
                              </code>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(checker.pin, "PIN")}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mt-6 justify-center">
                <Link to="/">
                  <Button variant="outline" className="w-full sm:w-auto">
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
  );
};

export default RetrieveVerify;
