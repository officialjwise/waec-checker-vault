import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import { clientApi } from "@/services/clientApi";

const Retrieve = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState("ghana");
  const [isLoading, setIsLoading] = useState(false);

  const countries = {
    ghana: { name: "Ghana", code: "+233", flag: "🇬🇭" },
    nigeria: { name: "Nigeria", code: "+234", flag: "🇳🇬" }
  };

  const handlePhoneNumberChange = (e) => {
    let value = e.target.value;
    value = value.replace(/[^\d\s-]/g, '');
    setPhoneNumber(value);
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
        description: "Please enter your phone number to continue.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const fullPhoneNumber = getFullPhoneNumber();
      console.log('Initiating retrieve for phone:', fullPhoneNumber);
      
      const response = await clientApi.initiateRetrieve(fullPhoneNumber);
      console.log('Initiate retrieve response:', response);
      
      // Only proceed if we get a successful response (not a 404 or error)
      if (response && !response.message?.includes('No checker found')) {
        toast({
          title: "OTP sent",
          description: "We've sent a verification code to your phone number.",
        });
        
        // Navigate to verify page with phone number and response data
        const cleanNumber = phoneNumber.replace(/[\s-]/g, '');
        
        const queryParams = new URLSearchParams({
          phone: cleanNumber,
          ...(response.requestId && { requestId: response.requestId }),
          ...(response.prefix && { prefix: response.prefix })
        });
        
        navigate(`/retrieve/verify?${queryParams.toString()}`);
      } else {
        // This shouldn't happen since errors should be thrown, but just in case
        throw new Error(response.message || 'No checkers found for this phone number');
      }
      
    } catch (error) {
      console.error('Error initiating retrieve:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to send verification code';
      
      // Handle specific error cases
      if (errorMessage.includes('No checker found') || 
          errorMessage.includes('404') || 
          errorMessage.includes('Failed to initiate retrieve: 404')) {
        toast({
          title: "No checkers found",
          description: "No result checkers found for this phone number. Please check the number and try again.",
          variant: "destructive"
        });
      } else if (errorMessage.includes('Network error') || errorMessage.includes('Failed to fetch')) {
        toast({
          title: "Connection Error",
          description: "Unable to connect to the server. Please check your internet connection and try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive"
        });
      }
    } finally {
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
                  <Label htmlFor="phone" className="text-base font-semibold text-gray-900">
                    Phone Number *
                  </Label>
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
                      placeholder="543 482 189"
                      value={phoneNumber}
                      onChange={handlePhoneNumberChange}
                      className="flex-1 h-12 text-lg border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <p className="text-sm text-gray-500">
                    Enter the phone number you used when purchasing checkers
                  </p>
                  {phoneNumber && (
                    <p className="text-sm text-blue-600 font-medium">
                      Full number: {getFullPhoneNumber()}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 h-12 text-lg font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Checking...
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
