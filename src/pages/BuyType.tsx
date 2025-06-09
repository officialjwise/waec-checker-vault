import { useState, useEffect } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, AlertCircle, Loader2, GraduationCap, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BuyType = () => {
  const { waecType } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [quantity, setQuantity] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("ghana");
  const [isLoading, setIsLoading] = useState(false);
  
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
    // Remove any non-digit characters except spaces and dashes
    value = value.replace(/[^\d\s-]/g, '');
    setPhoneNumber(value);
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    // Prevent zero or negative quantities
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

    setIsLoading(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate success (90% success rate)
    const success = Math.random() > 0.1;
    
    if (success) {
      const orderId = `ORD-${Date.now()}`;
      const fullPhoneNumber = getFullPhoneNumber();
      navigate(`/success?orderId=${orderId}&waecType=${waecType}&quantity=${quantity}&phone=${encodeURIComponent(fullPhoneNumber)}`);
    } else {
      // Simulate different failure reasons
      const errorCodes = ["card_declined", "insufficient_funds", "processing_error", "expired_card"];
      const randomError = errorCodes[Math.floor(Math.random() * errorCodes.length)];
      const fullPhoneNumber = getFullPhoneNumber();
      
      navigate(`/payment-failed?waecType=${waecType}&quantity=${quantity}&phone=${encodeURIComponent(fullPhoneNumber)}&error=${randomError}`);
      setIsLoading(false);
    }
  };

  const handleCancelPayment = () => {
    navigate("/");
  };

  if (!examTypeNames[waecType]) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Exam Type</h2>
            <p className="text-gray-600 mb-4">The exam type you selected is not valid.</p>
            <Link to="/buy">
              <Button>Back to Selection</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link to={waecType === "placement" ? "/" : "/buy"} className="mr-4">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Buy {examTypeNames[waecType]} {waecType !== "placement" && "Result Checker"}
                </h1>
                <p className="text-sm text-gray-600">{examTypeFullNames[waecType]}</p>
              </div>
            </div>
            <div className="flex items-center">
              <GraduationCap className="h-6 w-6 text-blue-600 mr-2" />
              <span className="text-lg font-bold text-gray-900">YoungPress</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Purchase Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Quantity */}
                {waecType !== "placement" && (
                  <div>
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="mt-1"
                      required
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      How many checkers do you need?
                    </p>
                  </div>
                )}

                {/* Phone Number with Country Dropdown */}
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="mt-1 flex gap-2">
                    <Select value={country} onValueChange={setCountry}>
                      <SelectTrigger className="w-32">
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
                      className="flex-1"
                      required
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    We'll send your {waecType === "placement" ? "placement results" : "checkers"} to this number via SMS
                  </p>
                  {phoneNumber && (
                    <p className="text-xs text-blue-600 mt-1">
                      Full number: {getFullPhoneNumber()}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <Label htmlFor="email">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Email backup of your {waecType === "placement" ? "placement results" : "checkers"} (recommended)
                  </p>
                </div>

                {/* Pricing Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span>Unit Price:</span>
                    <span className="font-semibold">¢{unitPrice.toFixed(2)}</span>
                  </div>
                  {waecType !== "placement" && (
                    <div className="flex justify-between items-center mb-2">
                      <span>Quantity:</span>
                      <span className="font-semibold">{quantity}</span>
                    </div>
                  )}
                  <hr className="my-2" />
                  <div className="flex justify-between items-center text-lg font-bold text-green-600">
                    <span>Total:</span>
                    <span>¢{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Processing Payment...
                      </>
                    ) : (
                      "Proceed to Pay"
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCancelPayment}
                    variant="outline"
                    className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel Payment
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default BuyType;
