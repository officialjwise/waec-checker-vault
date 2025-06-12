import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2, Shield, CheckCircle, X, CreditCard, Wifi, Plus, Minus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { clientApi } from "@/services/clientApi";

const BuyType = () => {
  const { waecType } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [quantity, setQuantity] = useState<number | undefined>(undefined);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("ghana");
  const [isProcessing, setIsProcessing] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<'checking' | 'available' | 'unavailable' | 'network-error'>('checking');
  const [errorMessage, setErrorMessage] = useState<string>("");
  
  const countries = {
    ghana: { name: "Ghana", code: "+233", flag: "🇬🇭" },
    nigeria: { name: "Nigeria", code: "+234", flag: "🇳🇬" }
  };

  const examTypeNames = {
    bece: "BECE",
    wassce: "WASSCE", 
    novdec: "NOVDEC",
    placement: "Placement Checker"
  };

  const examTypeFullNames = {
    bece: "Basic Education Certificate Examination",
    wassce: "West African Senior School Certificate Examination",
    novdec: "November/December WASSCE",
    placement: "School Placement Checker"
  };

  // Check availability on component mount
  useEffect(() => {
    const checkAvailability = async () => {
      console.log('Starting availability check for:', waecType);
      
      try {
        const waecTypeFormatted = clientApi.mapWaecType(waecType || '');
        console.log('Formatted WAEC type:', waecTypeFormatted);
        console.log('Making API call to check availability...');
        
        const availabilityResult = await clientApi.checkAvailability(waecTypeFormatted);
        console.log('Availability check result:', availabilityResult);
        
        if (availabilityResult.available) {
          setAvailabilityStatus('available');
          setErrorMessage("");
          console.log('Service is available');
        } else {
          setAvailabilityStatus('unavailable');
          setErrorMessage(availabilityResult.message || `${examTypeNames[waecType]} checkers are currently not available. Please try again later.`);
          console.log('Service unavailable:', availabilityResult.message);
          
          toast({
            title: "Service Temporarily Unavailable",
            description: availabilityResult.message || `${examTypeNames[waecType]} checkers are currently not available. Please try again later.`,
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Network error during availability check:', error);
        console.log('Error type:', error?.constructor?.name);
        console.log('Error message:', error?.message);
        
        // Handle network errors differently from service unavailability
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
          setAvailabilityStatus('network-error');
          setErrorMessage("Unable to connect to the service. Please check your internet connection and try again.");
          console.log('Network connectivity issue detected');
          
          toast({
            title: "Connection Error",
            description: "Unable to connect to our servers. Please check your internet connection and try again.",
            variant: "destructive"
          });
        } else {
          setAvailabilityStatus('unavailable');
          setErrorMessage("Service temporarily unavailable. Please try again later.");
          console.log('Other error occurred:', error);
          
          toast({
            title: "Service Error",
            description: "Unable to check service availability. Please try again later.",
            variant: "destructive"
          });
        }
      }
    };

    if (waecType) {
      checkAvailability();
    }
  }, [toast, waecType]);

  useEffect(() => {
    if (location.state?.prefillQuantity) {
      setQuantity(location.state.prefillQuantity);
    }
    if (location.state?.prefillPhone) {
      setPhoneNumber(location.state.prefillPhone);
    }
  }, [location.state]);

  const getUnitPrice = () => {
    return waecType === "placement" ? 20 : 17.5;
  };

  const unitPrice = getUnitPrice();
  const total = (quantity || 0) * unitPrice;

  const handlePhoneNumberChange = (e) => {
    let value = e.target.value;
    value = value.replace(/[^\d\s-]/g, '');
    setPhoneNumber(value);
  };

  const handleQuantityChange = (e) => {
    const value = e.target.value;
    if (value === "") {
      setQuantity(undefined);
    } else {
      const numValue = parseInt(value) || 0;
      setQuantity(numValue);
    }
  };

  const incrementQuantity = () => {
    setQuantity((prev) => (prev || 0) + 1);
  };

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(0, (prev || 0) - 1));
  };

  const getFullPhoneNumber = () => {
    if (!phoneNumber.trim()) return "";
    return clientApi.formatPhoneNumber(phoneNumber, country);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const retryAvailabilityCheck = async () => {
    setAvailabilityStatus('checking');
    setErrorMessage("");
    
    // Re-run the availability check
    try {
      const waecTypeFormatted = clientApi.mapWaecType(waecType || '');
      console.log('Retrying availability check...');
      
      const availabilityResult = await clientApi.checkAvailability(waecTypeFormatted);
      console.log('Retry result:', availabilityResult);
      
      if (availabilityResult.available) {
        setAvailabilityStatus('available');
        setErrorMessage("");
        toast({
          title: "Connection Restored",
          description: "Service is now available!",
        });
      } else {
        setAvailabilityStatus('unavailable');
        setErrorMessage(availabilityResult.message || `${examTypeNames[waecType]} checkers are currently not available.`);
      }
    } catch (error) {
      console.error('Retry failed:', error);
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        setAvailabilityStatus('network-error');
        setErrorMessage("Still unable to connect. Please check your internet connection.");
      } else {
        setAvailabilityStatus('unavailable');
        setErrorMessage("Service temporarily unavailable.");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submission started');
    console.log('Current availability status:', availabilityStatus);
    
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter your phone number to proceed.",
        variant: "destructive"
      });
      return;
    }

    if (!email.trim()) {
      toast({
        title: "Email required",
        description: "Please enter your email address to proceed.",
        variant: "destructive"
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive"
      });
      return;
    }

    // Validate quantity for non-placement types
    if (waecType !== "placement" && (!quantity || quantity < 1)) {
      toast({
        title: "Quantity required",
        description: "Please select at least 1 checker to proceed.",
        variant: "destructive"
      });
      return;
    }

    if (availabilityStatus === 'unavailable' || availabilityStatus === 'network-error') {
      toast({
        title: "Service Unavailable",
        description: "Please wait for service to become available or check your connection.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      const formattedPhone = getFullPhoneNumber();
      const waecTypeFormatted = clientApi.mapWaecType(waecType || '');
      
      const orderData = {
        waec_type: waecTypeFormatted,
        quantity: waecType === "placement" ? 1 : (quantity || 1),
        phone: formattedPhone,
        email: email.trim(),
      };

      console.log('Submitting order:', orderData);

      const response = await clientApi.initiateOrder(orderData);
      
      console.log('Order initiated successfully:', response);
      
      toast({
        title: "Order Initiated",
        description: "Redirecting to payment gateway...",
      });

      // Redirect to Paystack payment URL
      window.location.href = response.payment_url;
      
    } catch (error) {
      console.error('Order initiation failed:', error);
      
      toast({
        title: "Order Failed",
        description: error instanceof Error ? error.message : "Failed to initiate order. Please try again.",
        variant: "destructive"
      });
      
      setIsProcessing(false);
    }
  };

  if (!examTypeNames[waecType]) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50">
        <Header />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="max-w-md mx-auto shadow-xl">
            <CardContent className="text-center py-8">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Exam Type</h2>
              <p className="text-gray-600 mb-4">The exam type you selected is not valid.</p>
              <Button onClick={() => navigate("/buy")} className="bg-blue-600 hover:bg-blue-700">
                Back to Selection
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50">
      <Header 
        showBackButton={true}
        backTo={waecType === "placement" ? "/" : "/buy"}
        title={`Buy ${examTypeNames[waecType]} ${waecType !== "placement" ? "Result Checker" : ""}`}
        subtitle={examTypeFullNames[waecType]}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Availability Status */}
          {availabilityStatus === 'checking' && (
            <Alert className="mb-6 bg-blue-50 border-blue-200">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <AlertDescription className="text-blue-800">
                Checking {examTypeNames[waecType]} checker availability...
              </AlertDescription>
            </Alert>
          )}

          {availabilityStatus === 'available' && (
            <Alert className="mb-6 bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 font-medium">
                {examTypeNames[waecType]} checkers are available
              </AlertDescription>
            </Alert>
          )}

          {availabilityStatus === 'network-error' && (
            <Alert className="mb-6 bg-orange-50 border-orange-200">
              <Wifi className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{errorMessage}</span>
                  <Button 
                    onClick={retryAvailabilityCheck}
                    variant="outline" 
                    size="sm" 
                    className="ml-4 border-orange-300 text-orange-700 hover:bg-orange-100"
                  >
                    Retry
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {availabilityStatus === 'unavailable' && (
            <Alert className="mb-6 bg-red-50 border-red-200">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{errorMessage}</span>
                  <Button 
                    onClick={retryAvailabilityCheck}
                    variant="outline" 
                    size="sm" 
                    className="ml-4 border-red-300 text-red-700 hover:bg-red-100"
                  >
                    Retry
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">1</div>
                <span className="text-gray-700">Purchase Details</span>
              </div>
              <div className="w-16 h-0.5 bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-semibold">2</div>
                <span className="text-gray-500">Payment</span>
              </div>
              <div className="w-16 h-0.5 bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center font-semibold">3</div>
                <span className="text-gray-500">Confirmation</span>
              </div>
            </div>
          </div>

          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
              <CardTitle className="text-2xl text-center flex items-center justify-center">
                <CreditCard className="h-6 w-6 mr-2" />
                Purchase Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Product Summary */}
                <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-xl border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    You are purchasing
                  </h3>
                  <div className="text-lg font-medium text-gray-800">
                    {examTypeNames[waecType]} {waecType !== "placement" && "Result Checker"}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">{examTypeFullNames[waecType]}</div>
                </div>

                {/* Quantity with Number Dialer */}
                {waecType !== "placement" && (
                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-base font-semibold text-gray-900">Quantity *</Label>
                    <div className="flex items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={decrementQuantity}
                        className="h-12 w-12 border-2 hover:bg-gray-100"
                        disabled={!quantity || quantity <= 0}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        id="quantity"
                        type="number"
                        min="0"
                        placeholder="Enter quantity"
                        value={quantity || ""}
                        onChange={handleQuantityChange}
                        className="h-12 text-lg text-center border-2 focus:border-blue-500 flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={incrementQuantity}
                        className="h-12 w-12 border-2 hover:bg-gray-100"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500">
                      How many checkers do you need? (minimum 1 required)
                    </p>
                  </div>
                )}

                {/* Phone Number with Country Dropdown */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-base font-semibold text-gray-900">Phone Number *</Label>
                  <div className="flex gap-3">
                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger className="w-40 h-12 border-2">
                        <SelectValue>
                          <div className="flex items-center">
                            <span className="mr-2">{countries[country].flag}</span>
                            <span className="text-sm">{countries[country].code}</span>
                          </div>
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(countries).map(([key, countryData]) => (
                          <SelectItem key={key} value={key}>
                            <div className="flex items-center">
                              <span className="mr-2">{countryData.flag}</span>
                              <span>{countryData.name} ({countryData.code})</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="123 456 789"
                      value={phoneNumber}
                      onChange={handlePhoneNumberChange}
                      className="flex-1 h-12 text-lg border-2 focus:border-blue-500"
                      required
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    We'll send your {waecType === "placement" ? "placement results" : "checkers"} to this number via SMS
                  </p>
                  {phoneNumber && (
                    <p className="text-sm text-blue-600 font-medium">
                      Full number: +{getFullPhoneNumber()}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-semibold text-gray-900">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 text-lg border-2 focus:border-blue-500"
                    required
                  />
                  <p className="text-sm text-gray-500">
                    Email backup of your {waecType === "placement" ? "placement results" : "checkers"} (required)
                  </p>
                </div>

                {/* Pricing Summary */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-xl border-2 border-green-200">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Shield className="h-5 w-5 text-green-600 mr-2" />
                    Order Summary
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Unit Price:</span>
                      <span className="font-semibold text-lg">¢{unitPrice.toFixed(2)}</span>
                    </div>
                    {waecType !== "placement" && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Quantity:</span>
                        <span className="font-semibold text-lg">{quantity || 0}</span>
                      </div>
                    )}
                    <hr className="border-gray-300" />
                    <div className="flex justify-between items-center text-xl font-bold text-green-600">
                      <span>Total Amount:</span>
                      <span>¢{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-4">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    disabled={isProcessing || availabilityStatus === 'unavailable' || availabilityStatus === 'network-error'}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Initiating Payment...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Proceed to Pay ¢{total.toFixed(2)}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-2 text-sm text-gray-600 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
              <Shield className="h-4 w-4 text-green-600" />
              <span>Your payment is secured with Paystack and 256-bit SSL encryption</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BuyType;
