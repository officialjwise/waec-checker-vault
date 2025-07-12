
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Search, GraduationCap, MapPin, CheckCircle, Users, Award, Shield, MessageCircle, Building } from "lucide-react";
import Header from "@/components/Header";

const Index = () => {
  const handleUniversityFormsClick = () => {
    const message = encodeURIComponent("Hi, I'm interested in buying a university form.");
    const whatsappUrl = `https://wa.me/+233557538158?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-purple-50">
      <Header />

      {/* Hero Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Access Your <span className="text-blue-600">WAEC Results</span> & 
              <span className="text-purple-600"> School Placements</span>
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              The most trusted platform for WAEC result checkers and school placement verification. 
              Fast, secure, and reliable access to your educational records.
            </p>
            
            {/* Trust Indicators */}
            <div className="flex justify-center items-center space-x-8 mb-12">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">100% Secure</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-700">Instant Access</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-700">Trusted by 50K+ Students</span>
              </div>
            </div>

            {/* University Forms Button */}
            <div className="mb-12">
              <Button
                onClick={handleUniversityFormsClick}
                className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-full"
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Buy University Forms
              </Button>
              <p className="text-sm text-gray-600 mt-2">Get help with university application forms via WhatsApp</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto mb-12">
          {/* Buy Checker Card */}
          <Card className="hover:shadow-2xl transition-all duration-300 border-2 hover:border-blue-300 transform hover:-translate-y-2 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <ShoppingCart className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                Buy WAEC Result Checker
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 leading-relaxed">
                Purchase new result checkers for BECE, WASSCE, NOVDEC, or CTVET examinations
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm font-semibold text-blue-800 mb-3">Available Examinations:</p>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700"><strong>BECE</strong> - Basic Education Certificate</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700"><strong>WASSCE</strong> - West African Senior School Certificate</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700"><strong>NOVDEC</strong> - November/December WASSCE</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700"><strong>CTVET</strong> - Technical & Vocational Education</span>
                    </li>
                  </ul>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">Starting from ¢15.00 each</p>
                  <Link to="/buy">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                      Buy Now
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Placement Checker Card */}
          <Card className="hover:shadow-2xl transition-all duration-300 border-2 hover:border-purple-300 transform hover:-translate-y-2 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <MapPin className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                School Placement Checker
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 leading-relaxed">
                Check your SHS placement status after BECE results with comprehensive school information
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-6">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <p className="text-sm font-semibold text-purple-800 mb-3">Placement Services:</p>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">Senior High School (SHS) placement</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">TVET placement verification</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">School selection confirmation</span>
                    </li>
                  </ul>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-2">¢20.00 per check</p>
                  <Link to="/buy/CSSPS">
                    <Button className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                      Check Placement
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Retrieve Checker Card */}
          <Card className="hover:shadow-2xl transition-all duration-300 border-2 hover:border-green-300 transform hover:-translate-y-2 bg-gradient-to-br from-green-50 to-white">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <Search className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                Retrieve Old Checker
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 leading-relaxed">
                Access your previously purchased result checkers using your phone number with full history
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-6">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm font-semibold text-green-800 mb-3">You can retrieve:</p>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">All your purchased checkers</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">Serial numbers and PINs</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">Complete purchase history</span>
                    </li>
                  </ul>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4 font-medium">Secure verification required</p>
                  <Link to="/retrieve">
                    <Button variant="outline" className="w-full border-2 border-green-600 text-green-600 hover:bg-green-50 hover:border-green-700 py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
                      Retrieve Checkers
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* University Forms Card */}
          <Card className="hover:shadow-2xl transition-all duration-300 border-2 hover:border-orange-300 transform hover:-translate-y-2 bg-gradient-to-br from-orange-50 to-white">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-20 h-20 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
                <Building className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-900 mb-2">
                University Forms
              </CardTitle>
              <CardDescription className="text-sm text-gray-600 leading-relaxed">
                Get assistance with university application forms and admissions process
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-6">
                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                  <p className="text-sm font-semibold text-orange-800 mb-3">Available Services:</p>
                  <ul className="text-sm space-y-2">
                    <li className="flex items-center">
                      <div className="w-3 h-3 bg-orange-500 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">University application forms</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-3 h-3 bg-orange-500 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">Admission guidance</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-3 h-3 bg-orange-500 rounded-full mr-3 flex-shrink-0"></div>
                      <span className="text-gray-700">Document assistance</span>
                    </li>
                  </ul>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4 font-medium">Chat with us on WhatsApp</p>
                  <Button 
                    onClick={handleUniversityFormsClick}
                    className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white py-3 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contact Us
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info Section */}
        <div className="mt-20 text-center">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl mx-auto border border-gray-100">
            <div className="flex items-center justify-center mb-6">
              <Award className="h-8 w-8 text-blue-600 mr-3" />
              <h3 className="text-2xl font-bold text-gray-900">Need Assistance?</h3>
            </div>
            <p className="text-gray-600 mb-6 text-lg leading-relaxed">
              Our dedicated support team is here to help you with any questions about accessing your results, 
              making purchases, or resolving technical issues. We're committed to your success.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-gray-800 mb-1">Support Hours</p>
                <p className="text-sm text-gray-600">Monday - Friday<br/>8:00 AM - 6:00 PM</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-gray-800 mb-1">Phone Support</p>
                <p className="text-sm text-gray-600">+233 123 456 789<br/>Toll-free calls</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-semibold text-gray-800 mb-1">Email Support</p>
                <p className="text-sm text-gray-600">support@youngpress.com<br/>24/7 response</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
