
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Upload, 
  Package, 
  Settings,
  Shield,
  LogOut,
  BarChart3,
  Menu,
  X
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import ThemeToggle from './ThemeToggle';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const AdminSidebar = ({ isOpen, onClose }: AdminSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Users, label: 'User Management', path: '/admin/users' },
    { icon: FileText, label: 'Orders', path: '/admin/orders' },
    { icon: Upload, label: 'CSV Upload', path: '/admin/upload' },
    { icon: Package, label: 'Inventory', path: '/admin/inventory' },
    { icon: BarChart3, label: 'Analytics', path: '/admin/analytics' },
    { icon: Shield, label: 'Admin Logs', path: '/admin/logs' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  const handleLogout = () => {
    navigate('/admin');
  };

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onClose()}
          className="bg-background/80 backdrop-blur-sm border-border/50"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full w-64 bg-card/95 backdrop-blur-sm border-r border-border/50 transform transition-all duration-300 ease-in-out z-50 shadow-xl",
        "lg:translate-x-0 lg:static lg:z-auto lg:shadow-none",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              WAEC Admin
            </h2>
            <ThemeToggle />
          </div>
          <p className="text-xs text-muted-foreground mt-1">Management Portal</p>
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6 space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant={location.pathname === item.path ? "default" : "ghost"}
              className={cn(
                "w-full justify-start text-left font-medium transition-all duration-200",
                location.pathname === item.path 
                  ? "bg-primary text-primary-foreground shadow-md" 
                  : "hover:bg-muted/50 hover:translate-x-1"
              )}
              onClick={() => {
                navigate(item.path);
                onClose();
              }}
            >
              <item.icon className="h-4 w-4 mr-3" />
              {item.label}
            </Button>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-4 left-4 right-4">
          <Button
            variant="outline"
            className="w-full justify-start border-destructive/20 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-200"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 mr-3" />
            Logout
          </Button>
        </div>
      </div>
    </>
  );
};

export default AdminSidebar;
