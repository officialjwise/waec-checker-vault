
import { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Printer, ExternalLink, Grid3x3, Rows2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { clientApi } from "@/services/clientApi";

const Success = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [orderId, setOrderId] = useState("");
  const [waecType, setWaecType] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState("");
  
  const [checkers, setCheckers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [purchaseDate, setPurchaseDate] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [verificationError, setVerificationError] = useState("");
  const [isNetworkError, setIsNetworkError] = useState(false);

  const examTypeNames = {
    bece: "BECE",
    wassce: "WASSCE", 
    novdec: "NOVDEC",
    placement: "Placement Checker"
  };

  const resultCheckingUrls = {
    bece: "https://eresults.waecgh.org",
    wassce: "https://ghana.waecdirect.org",
    novdec: "https://ghana.waecdirect.org",
    placement: "https://cssps.gov.gh"
  };

  // Process URL parameters on mount and verify payment
  useEffect(() => {
    // Get all reference values and prioritize the trxref (Paystack reference)
    const trxref = searchParams.get("trxref");
    const reference = searchParams.get("reference");
    const status = searchParams.get("status");
    const backendOrderId = searchParams.get("order_id");
    
    if (trxref || reference) {
      // Use trxref as the primary reference (Paystack's actual transaction reference)
      const paymentReference = trxref || reference;
      
      if (paymentReference && (status === "success" || status === "successful")) {
        verifyPayment(paymentReference);
      } else if (backendOrderId && status === "success") {
        // Handle direct success from backend redirect
        fetchOrderDetails(backendOrderId);
      } else {
        setVerificationError("Payment status is not confirmed. Please contact support if you made a payment.");
        setIsLoading(false);
      }
    } else {
      setVerificationError("No payment reference found. Please contact support if you made a payment.");
      setIsLoading(false);
    }
  }, [searchParams]);

  const verifyPayment = async (reference: string) => {
    try {
      setIsLoading(true);
      setVerificationError("");
      setIsNetworkError(false);
      
      const response = await clientApi.verifyPayment(reference);
      
      if (response.status === "success" && response.checkers && response.checkers.length > 0) {
        setOrderId(response.order_id);
        setWaecType(response.waec_type.toLowerCase());
        setQuantity(response.quantity);
        setPhoneNumber(response.phone_number);
        setCheckers(response.checkers);
        
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
          title: "Payment Verified Successfully",
          description: response.message || "Your payment has been verified and checkers have been generated.",
        });
        
        // Clean up URL
        navigate("/success", { replace: true });
      } else {
        throw new Error("Payment verification failed or no checkers were generated");
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to verify payment";
      
      // Check if it's a network error
      if (errorMessage.includes("Network error") || errorMessage.includes("Failed to fetch")) {
        setIsNetworkError(true);
        setVerificationError("Unable to connect to our servers. This appears to be a temporary issue. Please try refreshing the page or contact support.");
      } else {
        setVerificationError(errorMessage);
      }
      
      toast({
        title: "Verification Failed",
        description: "Failed to verify your payment. Please contact support with your payment reference.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrderDetails = async (orderIdParam: string) => {
    try {
      setIsLoading(true);
      // This would require an additional endpoint to fetch order details
      // For now, we'll extract basic info from URL parameters
      setOrderId(orderIdParam);
      
      toast({
        title: "Order Processed",
        description: "Your order has been processed successfully.",
      });
    } catch (error) {
      setVerificationError("Failed to fetch order details");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "grid" ? "list" : "grid");
  };

  const handleRetry = () => {
    window.location.reload();
  };

  if (verificationError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <div className="max-w-md mx-auto text-center p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {isNetworkError ? "Connection Error" : "Verification Error"}
          </h2>
          <p className="text-gray-600 mb-4">{verificationError}</p>
          <div className="space-y-3">
            {isNetworkError && (
              <Button onClick={handleRetry} className="w-full">
                Try Again
              </Button>
            )}
            <p className="text-sm text-gray-500">
              If you made a payment, please contact support with your payment reference.
            </p>
            <Link to="/">
              <Button variant="outline" className="w-full">Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Verifying your payment and generating checkers...</p>
        </div>
      </div>
    );
  }

  if (!checkers || checkers.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
        <div className="max-w-md mx-auto text-center p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Checkers Found</h2>
          <p className="text-gray-600 mb-4">No checkers were found for this order. Please contact support.</p>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
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
        {/* Header - Hidden in print */}
        <header className="bg-white shadow-sm border-b no-print">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link to="/" className="mr-4">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Return Home
                  </Button>
                </Link>
                <h1 className="text-xl font-bold text-gray-900">Purchase Successful</h1>
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
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 print-container">
          <div className="max-w-6xl mx-auto">
            <div className={
              viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print-grid" 
                : "space-y-4 print-list"
            }>
              {checkers.map((checker) => (
                <div key={checker.id} className="checker-card bg-white border-2 border-gray-800 p-6 text-center">
                  <h2 className="checker-title text-xl font-bold mb-4">
                    {examTypeNames[waecType]} {waecType === "placement" ? "" : "RESULT CHECKER"}
                  </h2>
                  
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
                      href={resultCheckingUrls[waecType]}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="check-button inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                    >
                      {waecType === "placement" ? "Check Your Placement" : "Check Your Results"}
                      <ExternalLink className="h-4 w-4 ml-2" />
                    </a>
                    
                    <div className="space-y-1 text-sm">
                      <p className="purchase-info">
                        <span className="font-semibold">Purchased by:</span> +{phoneNumber}
                      </p>
                      <p className="purchase-info">
                        <span className="font-semibold">Date:</span> {purchaseDate}
                      </p>
                      <p className="purchase-info">
                        <span className="font-semibold">Order ID:</span> {orderId}
                      </p>
                      <p className="instructions text-xs text-gray-600">
                        Use your serial and PIN on the website above to {waecType === "placement" ? "check your placement" : "check your results"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons - Hidden in print */}
          <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center no-print">
            <Link to="/">
              <Button variant="outline" className="w-full sm:w-auto">
                <Home className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Link to={waecType === "placement" ? "/" : "/buy"}>
              <Button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                {waecType === "placement" ? "Buy More Services" : "Buy More Checkers"}
              </Button>
            </Link>
          </div>
        </main>
      </div>
    </>
  );
};

export default Success;
