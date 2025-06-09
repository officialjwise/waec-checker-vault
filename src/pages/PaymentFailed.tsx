
import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Home, RefreshCw, CreditCard } from "lucide-react";

const PaymentFailed = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const waecType = searchParams.get("waecType");
  const quantity = parseInt(searchParams.get("quantity") || "1");
  const phoneNumber = searchParams.get("phone") || "";
  const errorCode = searchParams.get("error");
  
  const [failureReason, setFailureReason] = useState("");

  const examTypeNames = {
    bece: "BECE",
    wassce: "WASSCE", 
    novdec: "NOVDEC",
    placement: "Placement Checker"
  };

  // Clean up URL parameters after component mounts
  useEffect(() => {
    if (waecType) {
      // Replace the current URL without the query parameters
      navigate("/payment-failed", { replace: true });
    }
  }, [waecType, navigate]);

  // Set failure reason based on error code
  useEffect(() => {
    const getFailureReason = (code) => {
      switch (code) {
        case "card_declined":
          return "Your card was declined. Please try a different payment method.";
        case "insufficient_funds":
          return "Insufficient funds. Please check your account balance.";
        case "expired_card":
          return "Your card has expired. Please use a different card.";
        case "processing_error":
          return "There was an error processing your payment. Please try again.";
        case "canceled":
          return "Payment was canceled by user.";
        default:
          return "Payment could not be completed. Please try again or contact support.";
      }
    };

    setFailureReason(getFailureReason(errorCode));
  }, [errorCode]);

  const handleRetryPayment = () => {
    if (waecType === "placement") {
      navigate("/");
    } else {
      navigate(`/buy/${waecType}`, { 
        state: { 
          prefillQuantity: quantity,
          prefillPhone: phoneNumber 
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link to="/" className="mr-4">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <h1 className="text-xl font-bold text-gray-900">Payment Failed</h1>
            </div>
            <div className="flex items-center">
              <CreditCard className="h-6 w-6 text-red-600 mr-2" />
              <span className="text-lg font-bold text-gray-900">YoungPress</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-600">Payment Failed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Error Message */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-center">{failureReason}</p>
              </div>

              {/* Order Summary */}
              {waecType && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold mb-3">Order Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Service:</span>
                      <span className="font-medium">
                        {examTypeNames[waecType]} {waecType !== "placement" && "Result Checker"}
                      </span>
                    </div>
                    {waecType !== "placement" && (
                      <div className="flex justify-between">
                        <span>Quantity:</span>
                        <span className="font-medium">{quantity}</span>
                      </div>
                    )}
                    {phoneNumber && (
                      <div className="flex justify-between">
                        <span>Phone:</span>
                        <span className="font-medium">{phoneNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={handleRetryPayment}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Link to="/" className="flex-1">
                  <Button variant="outline" className="w-full">
                    <Home className="h-4 w-4 mr-2" />
                    Back to Home
                  </Button>
                </Link>
              </div>

              {/* Help Section */}
              <div className="border-t pt-6">
                <h4 className="font-semibold mb-2">Need Help?</h4>
                <p className="text-sm text-gray-600 mb-3">
                  If you continue to experience issues, please contact our support team:
                </p>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Email:</span> support@youngpress.com</p>
                  <p><span className="font-medium">Phone:</span> +233 XX XXX XXXX</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default PaymentFailed;
