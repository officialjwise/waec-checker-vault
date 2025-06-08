
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Search, GraduationCap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center">
            <GraduationCap className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-2xl font-bold text-gray-900">YoungPress</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Access Your WAEC Results
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Buy new result checkers or retrieve your previously purchased ones for BECE, WASSCE, and NOVDEC examinations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Buy Checker Card */}
          <Card className="hover:shadow-lg transition-shadow duration-300 border-2 hover:border-blue-200">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Buy WAEC Result Checker
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                Purchase new result checkers for BECE, WASSCE, or NOVDEC examinations
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Available for:</p>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      BECE (Basic Education Certificate Examination)
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      WASSCE (West African Senior School Certificate Examination)
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      NOVDEC (November/December WASSCE)
                    </li>
                  </ul>
                </div>
                <div className="text-center">
                  <Link to="/buy">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-lg font-semibold">
                      Buy Now
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Retrieve Checker Card */}
          <Card className="hover:shadow-lg transition-shadow duration-300 border-2 hover:border-green-200">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <Search className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Retrieve Old Checker
              </CardTitle>
              <CardDescription className="text-base text-gray-600">
                Access your previously purchased result checkers using your phone number
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">You can retrieve:</p>
                  <ul className="text-sm space-y-1">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      All your purchased checkers
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Serial numbers and PINs
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Purchase history
                    </li>
                  </ul>
                </div>
                <div className="text-center">
                  <p className="text-lg text-gray-600 mb-4">Verification required</p>
                  <Link to="/retrieve">
                    <Button variant="outline" className="w-full border-green-600 text-green-600 hover:bg-green-50 py-3 text-lg font-semibold">
                      Retrieve Checkers
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg shadow-sm p-8 max-w-3xl mx-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Need Help?</h3>
            <p className="text-gray-600 mb-4">
              If you're having trouble accessing your results or need assistance with your purchase, 
              please contact our support team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="text-sm text-gray-500">
                <strong>Support Hours:</strong> Monday - Friday, 8:00 AM - 6:00 PM
              </div>
              <div className="text-sm text-gray-500">
                <strong>Phone:</strong> +233 123 456 789
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
