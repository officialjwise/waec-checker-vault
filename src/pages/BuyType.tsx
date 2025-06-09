
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, Loader2, Shield, CheckCircle, X, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";

const BuyType = () => {
  const { waecType } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [quantity, setQuantity] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("ghana");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentCancelled, setPaymentCancelled] = useState(false);
  
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
  const total = quantity * unitPrice;

  const handlePhoneNumberChange = (e) => {
    let value = e.target.value;
    value = value.replace(/[^\d\s-]/g, '');
    setPhoneNumber(value);
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    if (value < 1) {
      setQuantity(1);
    } else {
      setQuantity(value);
    }
  };

  const getFullPhoneNumber = () => {
    if (!phoneNumber.trim()) return "";
    const selectedCountry = countries[country];
    const cleanNumber = phoneNumber.replace(/[\s-]/g, '');
    
    if (country === "ghana") {
      if (cleanNumber.startsWith('233')) {
        return `+${cleanNumber}`;
      } else if (cleanNumber.startsWith('0')) {
        return `+233${cleanNumber.substring(1)}`;
      } else {
        return `+233${cleanNumber}`;
      }
    } else if (country === "nigeria") {
      if (cleanNumber.startsWith('234')) {
        return `+${cleanNumber}`;
      } else if (cleanNumber.startsWith('0')) {
        return `+234${cleanNumber.substring(1)}`;
      } else {
        return `+234${cleanNumber}`;
      }
    }
    
    return `${selectedCountry.code}${cleanNumber}`;
  };

  const handleCancelPayment = () => {
    setPaymentCancelled(true);
    setIsProcessing(false);
    toast({
      title: "Payment Cancelled",
      description: "Your payment has been cancelled. You can try again anytime.",
      variant: "destructive"
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter your phone number to proceed.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setPaymentCancelled(false);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if payment was cancelled during processing
    if (paymentCancelled) {
      return;
    }
    
    // Simulate success (90% success rate)
    const success = Math.random() > 0.1;
    
    if (success) {
      const orderId = `ORD-${Date.now()}`;
      const fullPhoneNumber = getFullPhoneNumber();
      navigate(`/success?orderId=${orderId}&waecType=${waecType}&quantity=${quantity}&phone=${encodeURIComponent(fullPhoneNumber)}`);
    } else {
      const errorCodes = ["card_declined", "insufficient_funds", "processing_error", "expired_card"];
      const randomError = errorCodes[Math.floor(Math.random() * errorCodes.length)];
      const fullPhoneNumber = getFullPhoneNumber();
      
      navigate(`/payment-failed?waecType=${waecType}&quantity=${quantity}&phone=${encodeURIComponent(fullPhoneNumber)}&error=${randomError}`);
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

                {/* Quantity */}
                {waecType !== "placement" && (
                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-base font-semibold text-gray-900">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="h-12 text-lg border-2 focus:border-blue-500"
                      required
                    />
                    <p className="text-sm text-gray-500">
                      How many checkers do you need?
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
                      Full number: {getFullPhoneNumber()}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base font-semibold text-gray-900">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 text-lg border-2 focus:border-blue-500"
                  />
                  <p className="text-sm text-gray-500">
                    Email backup of your {waecType === "placement" ? "placement results" : "checkers"} (recommended)
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
                        <span className="font-semibold text-lg">{quantity}</span>
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
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Proceed to Pay ¢{total.toFixed(2)}
                      </>
                    )}
                  </Button>
                  
                  {/* Cancel Payment Button - Only shown during processing */}
                  {isProcessing && (
                    <Button
                      type="button"
                      onClick={handleCancelPayment}
                      variant="outline"
                      className="w-full border-2 border-red-300 text-red-600 hover:bg-red-50 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <X className="h-5 w-5 mr-2" />
                      Cancel Payment
                    </Button>
                  )}
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <div className="mt-8 text-center">
            <div className="inline-flex items-center space-x-2 text-sm text-gray-600 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-md">
              <Shield className="h-4 w-4 text-green-600" />
              <span>Your payment is secured with 256-bit SSL encryption</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BuyType;
