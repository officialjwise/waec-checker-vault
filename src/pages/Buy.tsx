
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, GraduationCap, Calendar } from "lucide-react";

const Buy = () => {
  const examTypes = [
    {
      type: "bece",
      title: "BECE",
      fullName: "Basic Education Certificate Examination",
      description: "For students completing Junior High School (JHS)",
      icon: BookOpen,
      color: "blue"
    },
    {
      type: "wassce",
      title: "WASSCE",
      fullName: "West African Senior School Certificate Examination",
      description: "For students completing Senior High School (SHS)",
      icon: GraduationCap,
      color: "green"
    },
    {
      type: "novdec",
      title: "NOVDEC",
      fullName: "November/December WASSCE",
      description: "Private candidates and repeat examination",
      icon: Calendar,
      color: "purple"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link to="/" className="mr-4">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center">
              <GraduationCap className="h-6 w-6 text-blue-600 mr-2" />
              <h1 className="text-xl font-bold text-gray-900">Buy WAEC Result Checker</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Select Examination Type
          </h2>
          <p className="text-gray-600">
            Choose the type of WAEC examination you need result checkers for
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {examTypes.map((exam) => {
            const IconComponent = exam.icon;
            const colorClasses = {
              blue: "bg-blue-100 text-blue-600 hover:border-blue-200",
              green: "bg-green-100 text-green-600 hover:border-green-200",
              purple: "bg-purple-100 text-purple-600 hover:border-purple-200"
            };

            return (
              <Card key={exam.type} className="hover:shadow-lg transition-all duration-300 border-2 hover:border-opacity-50">
                <CardHeader className="text-center pb-4">
                  <div className={`mx-auto w-16 h-16 ${colorClasses[exam.color]} rounded-full flex items-center justify-center mb-4`}>
                    <IconComponent className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-2xl font-bold text-gray-900">
                    {exam.title}
                  </CardTitle>
                  <CardDescription className="text-sm font-medium text-gray-700">
                    {exam.fullName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center mb-6">
                    {exam.description}
                  </p>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-green-600 mb-4">¢17.5 per checker</p>
                    <Link to={`/buy/${exam.type}`}>
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        Select {exam.title}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6 max-w-3xl mx-auto">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Important Information</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></span>
              Each checker provides access to one student's examination results
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></span>
              Results are available immediately after WAEC publishes them
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></span>
              You will receive Serial Numbers and PINs via SMS and email
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></span>
              All purchases are saved to your phone number for easy retrieval
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
};

export default Buy;
