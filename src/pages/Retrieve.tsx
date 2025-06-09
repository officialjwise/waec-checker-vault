
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";

const Retrieve = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      toast({
        title: "Phone number required",
        description: "Please enter your phone number to continue.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate API call to request OTP
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Check if it's our test number or simulate checking if phone number has purchases (80% success rate)
    const hasCheckers = phoneNumber === "0543482189" || Math.random() > 0.2;
    
    if (hasCheckers) {
      toast({
        title: "OTP sent",
        description: "We've sent a verification code to your phone number.",
      });
      
      // Navigate to verify page with phone number
      navigate(`/retrieve/verify?phone=${encodeURIComponent(phoneNumber)}`);
    } else {
      toast({
        title: "No checkers found",
        description: "No result checkers found for this phone number.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header 
        showBackButton={true}
        backTo="/"
        title="Retrieve Result Checkers"
        subtitle="Access your previously purchased checkers"
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Phone className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Retrieve Your Checkers
            </h2>
            <p className="text-gray-600">
              Enter your phone number to access your previously purchased result checkers
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-center">Phone Number Verification</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                    Phone Number
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                      <span className="text-gray-500 text-sm">🇬🇭 +233</span>
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="543 482 189"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 9))}
                      className="pl-16 h-12 text-base border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    Enter the phone number you used when purchasing checkers
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 h-12 text-lg font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Verifying...
                    </>
                  ) : (
                    "Send Verification Code"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm text-gray-600">
                <div>
                  <h4 className="font-medium text-gray-900">Can't remember your phone number?</h4>
                  <p>Try the phone number you used for mobile money payments or the one you received SMS notifications on.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Not receiving verification codes?</h4>
                  <p>Check your SMS inbox and ensure you have network coverage. Codes are usually received within 2 minutes.</p>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Still having issues?</h4>
                  <p>Contact our support team at +233 123 456 789 for assistance.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alternative Action */}
          <div className="text-center mt-6">
            <p className="text-gray-600 mb-3">Don't have any checkers yet?</p>
            <Link to="/buy">
              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                Buy Result Checkers
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Retrieve;
