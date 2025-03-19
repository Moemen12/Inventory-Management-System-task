import { Button } from "@/components/ui/button";
import { JSX, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { API_BASE_URL } from "@/lib/constants";
import { customKy } from "@/lib/utils";
import toast from "react-hot-toast";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog";
import { MeRes } from "@/types";
import {
  Clock,
  LayoutDashboard,
  LogOut,
  Package,
  ShoppingCart,
  Tag,
  User,
} from "lucide-react";

const Index = (): JSX.Element => {
  const navigate = useNavigate();

  // Query to fetch user details
  const { isPending, data } = useQuery<MeRes, { message: string }>({
    queryKey: ["me"],
    queryFn: async () => {
      return await customKy
        .get(`${API_BASE_URL}/user/me`, {
          credentials: "include",
        })
        .json();
    },
  });

  // Logout mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      await customKy.delete(`${API_BASE_URL}/auth/logout`, {
        credentials: "include",
      });
    },
    onError: () => {
      toast.error("Failed to log out");
    },
    onSuccess: () => {
      navigate("/");
    },
  });

  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  // Handle logout
  const handleLogout = () => {
    deleteMutation.mutateAsync();
  };

  // Get dynamic greeting based on time
  const getCurrentTimeGreeting = (): string => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return "Good morning";
    } else if (hour < 18) {
      return "Good afternoon";
    } else {
      return "Good evening";
    }
  };

  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-xl max-w-md w-full">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-red-600 font-medium text-xl mb-4">
            Error loading your data
          </p>
          <Button
            className="w-full py-3"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 md:p-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
              {getCurrentTimeGreeting()}, {data?.data.name}
            </h1>
            <p className="text-gray-500 mt-1">Welcome to your dashboard</p>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard/products/types"
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors"
            >
              <LayoutDashboard size={16} />
              Product Types
            </Link>
            <Link
              to="/dashboard/products/items"
              className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
            >
              <Package size={16} />
              Items
            </Link>
            <Button
              variant="destructive"
              className="px-6 py-2 rounded-full hover:bg-red-600 transition-all flex items-center gap-2"
              onClick={() => setIsLogoutDialogOpen(true)}
            >
              <LogOut size={16} />
              Logout
            </Button>
          </div>
        </div>

        {/* Confirmation Dialog */}
        <ConfirmationDialog
          isOpen={isLogoutDialogOpen}
          onClose={() => setIsLogoutDialogOpen(false)}
          onConfirm={handleLogout}
          title="Confirm Logout"
          description="Are you sure you want to log out?"
        />

        {/* General Data Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Tag size={32} className="text-blue-500" />
              </div>
              <p className="text-xl font-semibold text-gray-800 mb-1">
                Total Categories
              </p>
              <p className="text-3xl font-bold text-blue-500">
                {data?.data.added_product_types_count}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Package size={32} className="text-green-500" />
              </div>
              <p className="text-xl font-semibold text-gray-800 mb-1">
                Items in Stock
              </p>
              <p className="text-3xl font-bold text-green-500">
                {data?.data.added_products_count}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <ShoppingCart size={32} className="text-red-500" />
              </div>
              <p className="text-xl font-semibold text-gray-800 mb-1">
                Sold Items
              </p>
              <p className="text-3xl font-bold text-red-500">
                {data?.data.sold_products_count}
              </p>
            </div>
          </div>
        </div>

        {/* History Section */}
        <div className="bg-white rounded-2xl p-8 shadow-md mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <Clock size={20} className="mr-2 text-blue-500" />
            Recent Activity
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Last Added Products */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <p className="text-lg font-bold text-gray-700 mb-4 flex items-center">
                <Package size={18} className="mr-2 text-blue-500" />
                Last Added Products
              </p>
              {data?.data.last_added_products.length > 0 ? (
                <ul className="space-y-3">
                  {data.data.last_added_products.map((product) => (
                    <li
                      key={product.id}
                      className="flex items-center bg-white p-3 rounded-lg shadow-sm"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center mr-3">
                        <span className="text-blue-500 font-bold">
                          {product.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-800 block">
                          {product.name}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {product.created_at}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No recent products added.</p>
                </div>
              )}
            </div>
            {/* Last Added Product Types */}
            <div className="bg-gray-50 p-6 rounded-xl">
              <p className="text-lg font-bold text-gray-700 mb-4 flex items-center">
                <Tag size={18} className="mr-2 text-green-500" />
                Last Added Product Types
              </p>
              {data?.data.last_added_product_types.length > 0 ? (
                <ul className="space-y-3">
                  {data.data.last_added_product_types.map((type) => (
                    <li
                      key={type.id}
                      className="flex items-center bg-white p-3 rounded-lg shadow-sm"
                    >
                      <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center mr-3">
                        <span className="text-green-500 font-bold">
                          {type.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-800 block">
                          {type.name}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {type.created_at}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    No recent product types added.
                  </p>
                </div>
              )}
            </div>
          </div>
          {/* User Login Time */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center">
              <User size={20} className="mr-2 text-gray-500" />
              <p className="text-gray-700 font-medium">
                Account Created{" "}
                <span className="text-gray-500 ml-2">
                  {data?.data.human_time}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
