import { HelpCircle, Shield, FileText } from "lucide-react";

const DashboardFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full mt-auto py-6 border-t border-gray-100/80 bg-white/50 backdrop-blur-xs px-4">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-gray-400">
        
        {/* Left Side: Copyright Notice */}
        <div className="order-2 sm:order-1 transition-colors duration-200 hover:text-gray-500">
          &copy; {currentYear} EduSmart. All rights reserved.
        </div>

        {/* Right Side: Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 order-1 sm:order-2">
          <a
            href="#privacy"
            className="hover:text-gray-600 transition-colors duration-200 flex items-center gap-1.5 focus:outline-none focus:underline"
          >
            <Shield className="w-3.5 h-3.5 opacity-60" />
            Privacy Policy
          </a>
          
          <span className="hidden sm:inline text-gray-200" aria-hidden="true">•</span>
          
          <a
            href="#terms"
            className="hover:text-gray-600 transition-colors duration-200 flex items-center gap-1.5 focus:outline-none focus:underline"
          >
            <FileText className="w-3.5 h-3.5 opacity-60" />
            Terms of Service
          </a>
          
          <span className="hidden sm:inline text-gray-200" aria-hidden="true">•</span>
          
          <a
            href="#help"
            className="hover:text-gray-600 transition-colors duration-200 flex items-center gap-1.5 focus:outline-none focus:underline"
          >
            <HelpCircle className="w-3.5 h-3.5 opacity-60" />
            Help Center
          </a>
        </div>

      </div>
    </footer>
  );
};

export default DashboardFooter;