
import { Link } from "react-router-dom";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  showBackButton?: boolean;
  backTo?: string;
  title?: string;
  subtitle?: string;
}

const Header = ({ showBackButton = false, backTo = "/", title, subtitle }: HeaderProps) => {
  return (
    <header className="bg-white shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {showBackButton && (
              <Link to={backTo} className="mr-4">
                <Button variant="ghost" size="sm" className="hover:bg-gray-100">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
            )}
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-lg flex items-center justify-center">
                <img 
                  src="/lovable-uploads/5dfb2299-d472-4b3d-bd04-74456bd167ed.png" 
                  alt="YoungPress Logo" 
                  className="w-12 h-12 object-contain"
                />
              </div>
              <div>
                {title ? (
                  <>
                    <h1 className="text-xl font-bold text-gray-900">{title}</h1>
                    {subtitle && <p className="text-sm text-gray-600">{subtitle}</p>}
                  </>
                ) : (
                  <>
                    <h1 className="text-3xl font-bold text-gray-900">Young Press</h1>
                    <p className="text-sm text-gray-600">Powered by WAEC Official Services</p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
