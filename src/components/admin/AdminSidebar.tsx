
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
  BarChart3
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

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
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed left-0 top-0 h-full w-64 bg-card border-r transform transition-transform duration-200 ease-in-out z-50",
        "lg:translate-x-0 lg:static lg:z-auto",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6">
          <h2 className="text-xl font-bold text-foreground">WAEC Admin</h2>
        </div>

        <nav className="px-4 space-y-2">
          {menuItems.map((item) => (
            <Button
              key={item.path}
              variant={location.pathname === item.path ? "default" : "ghost"}
              className="w-full justify-start"
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

        <div className="absolute bottom-4 left-4 right-4">
          <Button
            variant="outline"
            className="w-full justify-start"
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
