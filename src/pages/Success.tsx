
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Copy, Download, Home, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Success = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const orderId = searchParams.get("orderId");
  const waecType = searchParams.get("waecType");
  const quantity = parseInt(searchParams.get("quantity") || "1");
  
  const [checkers, setCheckers] = useState([]);
  const [showPins, setShowPins] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const examTypeNames = {
    bece: "BECE",
    wassce: "WASSCE", 
    novdec: "NOVDEC"
  };

  // Generate mock checkers
  useEffect(() => {
    const generateCheckers = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const generatedCheckers = Array.from({ length: quantity }, (_, index) => ({
        id: index + 1,
        serial: `${waecType?.toUpperCase()}${Date.now()}${String(index + 1).padStart(3, '0')}`,
        pin: Math.random().toString(36).substring(2, 10).toUpperCase()
      }));
      
      setCheckers(generatedCheckers);
      setIsLoading(false);
    };

    if (orderId && waecType && quantity) {
      generateCheckers();
    }
  }, [orderId, waecType, quantity]);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
    });
  };

  const copyAllCheckers = () => {
    const allCheckers = checkers.map(checker => 
      `Serial: ${checker.serial}, PIN: ${checker.pin}`
    ).join('\n');
    
    navigator.clipboard.writeText(allCheckers);
    toast({
      title: "All checkers copied!",
      description: "All serial numbers and PINs copied to clipboard",
    });
  };

  if (!orderId || !waecType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Order</h2>
            <p className="text-gray-600 mb-4">No order information found.</p>
            <Link to="/">
              <Button>Back to Home</Button>
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
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900">Purchase Successful</h1>
            <p className="text-sm text-gray-600">Order ID: {orderId}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Message */}
          <div className="text-center mb-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600">
              Your {examTypeNames[waecType]} result checkers are ready
            </p>
          </div>

          {/* Checkers Display */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">
                  Your {examTypeNames[waecType]} Result Checkers ({quantity})
                </CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPins(!showPins)}
                  >
                    {showPins ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    {showPins ? "Hide" : "Show"} PINs
                  </Button>
                  {!isLoading && checkers.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyAllCheckers}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy All
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Generating your checkers...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {checkers.map((checker) => (
                    <div key={checker.id} className="bg-gray-50 p-4 rounded-lg border">
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
              )}
            </CardContent>
          </Card>

          {/* Important Notes */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">Important Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></span>
                  Keep your Serial Numbers and PINs safe - you'll need them to check results
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></span>
                  Your checkers have been sent to your phone number via SMS
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></span>
                  You can retrieve these checkers anytime using your phone number
                </li>
                <li className="flex items-start">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></span>
                  Visit the official WAEC website to check your results when they're released
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
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
      </main>
    </div>
  );
};

const Label = ({ children, className = "" }) => (
  <label className={`block text-sm font-medium text-gray-700 ${className}`}>
    {children}
  </label>
);

export default Success;
