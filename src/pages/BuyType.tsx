
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const BuyType = () => {
  const { waecType } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [quantity, setQuantity] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [availability, setAvailability] = useState({ available: true, remaining: 100 });
  
  const unitPrice = 17.5;
  const total = quantity * unitPrice;

  const examTypeNames = {
    bece: "BECE",
    wassce: "WASSCE", 
    novdec: "NOVDEC"
  };

  const examTypeFullNames = {
    bece: "Basic Education Certificate Examination",
    wassce: "West African Senior School Certificate Examination",
    novdec: "November/December WASSCE"
  };

  // Simulate availability check
  useEffect(() => {
    const checkAvailability = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate random availability (90% chance of being available)
      const isAvailable = Math.random() > 0.1;
      const remaining = isAvailable ? Math.floor(Math.random() * 50) + 50 : Math.floor(Math.random() * 5);
      
      setAvailability({ available: isAvailable, remaining });
      setIsLoading(false);
    };

    checkAvailability();
  }, [waecType]);

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

    if (quantity > availability.remaining) {
      toast({
        title: "Insufficient checkers",
        description: `Only ${availability.remaining} checkers available.`,
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
      navigate(`/success?orderId=${orderId}&waecType=${waecType}&quantity=${quantity}`);
    } else {
      toast({
        title: "Payment failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
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
          <div className="flex items-center">
            <Link to="/buy" className="mr-4">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Buy {examTypeNames[waecType]} Result Checker
              </h1>
              <p className="text-sm text-gray-600">{examTypeFullNames[waecType]}</p>
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
              {/* Availability Status */}
              <div className="mb-6 p-4 rounded-lg border">
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span>Checking availability...</span>
                  </div>
                ) : availability.available ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    <span>Available ({availability.remaining} remaining)</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-500">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    <span>Limited availability ({availability.remaining} remaining)</span>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Quantity */}
                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    max={availability.remaining}
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="mt-1"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Maximum: {availability.remaining} checkers
                  </p>
                </div>

                {/* Phone Number */}
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="e.g., +233 123 456 789"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="mt-1"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    We'll send your checkers to this number via SMS
                  </p>
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
                    Email backup of your checkers (recommended)
                  </p>
                </div>

                {/* Pricing Summary */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span>Unit Price:</span>
                    <span className="font-semibold">¢{unitPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span>Quantity:</span>
                    <span className="font-semibold">{quantity}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between items-center text-lg font-bold text-green-600">
                    <span>Total:</span>
                    <span>¢{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg"
                  disabled={isLoading || !availability.available || quantity > availability.remaining}
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

                {(!availability.available || quantity > availability.remaining) && (
                  <p className="text-center text-red-500 text-sm">
                    {!availability.available 
                      ? "This exam type is currently out of stock"
                      : "Please reduce the quantity to proceed"
                    }
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default BuyType;
