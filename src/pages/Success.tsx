
import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, Printer, ExternalLink, Grid3x3, Rows2 } from "lucide-react";

const Success = () => {
  const [searchParams] = useSearchParams();
  
  const orderId = searchParams.get("orderId");
  const waecType = searchParams.get("waecType");
  const quantity = parseInt(searchParams.get("quantity") || "1");
  const phoneNumber = searchParams.get("phone") || "";
  
  const [checkers, setCheckers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [purchaseDate, setPurchaseDate] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "list"

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

  // Generate mock checkers
  useEffect(() => {
    const generateCheckers = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
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
      
      if (waecType === "placement") {
        const placementChecker = {
          id: 1,
          serial: `PLC${Date.now()}`,
          pin: Math.floor(Math.random() * 90000000000) + 10000000000
        };
        setCheckers([placementChecker]);
      } else {
        const generatedCheckers = Array.from({ length: quantity }, (_, index) => ({
          id: index + 1,
          serial: `WGC${Date.now()}${String(index + 1).padStart(2, '0')}`,
          pin: Math.floor(Math.random() * 90000000000) + 10000000000
        }));
        setCheckers(generatedCheckers);
      }
      
      setIsLoading(false);
    };

    if (orderId && waecType) {
      generateCheckers();
    }
  }, [orderId, waecType, quantity]);

  const handlePrint = () => {
    window.print();
  };

  const toggleViewMode = () => {
    setViewMode(viewMode === "grid" ? "list" : "grid");
  };

  if (!orderId || !waecType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
        <div className="max-w-md mx-auto text-center p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Order</h2>
          <p className="text-gray-600 mb-4">No order information found.</p>
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Print styles */}
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
            }
            .print-container {
              background: white !important;
              margin: 0 !important;
              padding: 20px !important;
            }
            .checker-card {
              border: 2px solid #000 !important;
              background: white !important;
              page-break-inside: avoid !important;
              margin: 20px 0 !important;
              padding: 20px !important;
            }
            .print-grid {
              display: grid !important;
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)) !important;
              gap: 20px !important;
            }
            .print-list {
              display: block !important;
            }
            .print-list .checker-card {
              display: block !important;
              width: 100% !important;
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
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Generating your {waecType === "placement" ? "placement checker" : "checkers"}...</p>
              </div>
            ) : (
              <div className={
                viewMode === "grid" 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 print-grid" 
                  : "space-y-4 print-list"
              }>
                {checkers.map((checker) => (
                  <div key={checker.id} className="checker-card bg-white border-2 border-gray-800 p-6 text-center">
                    <h2 className="text-xl font-bold mb-4">
                      {examTypeNames[waecType]} {waecType === "placement" ? "" : "RESULT CHECKER"}
                    </h2>
                    
                    {/* Dotted line */}
                    <div className="border-t-2 border-dotted border-gray-600 mb-4"></div>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-lg">
                        <span className="font-semibold">Serial:</span> {checker.serial}
                      </p>
                      <p className="text-lg">
                        <span className="font-semibold">PIN:</span> {checker.pin}
                      </p>
                    </div>
                    
                    {/* Dotted line */}
                    <div className="border-t-2 border-dotted border-gray-600 mb-4"></div>
                    
                    <div className="space-y-3">
                      <a
                        href={resultCheckingUrls[waecType]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                      >
                        {waecType === "placement" ? "Check Your Placement" : "Check Your Results"}
                        <ExternalLink className="h-4 w-4 ml-2" />
                      </a>
                      
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="font-semibold">Purchased by:</span> {phoneNumber}
                        </p>
                        <p>
                          <span className="font-semibold">Date:</span> {purchaseDate}
                        </p>
                        <p className="text-xs text-gray-600">
                          Use your serial and PIN on the website above to {waecType === "placement" ? "check your placement" : "check your results"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
