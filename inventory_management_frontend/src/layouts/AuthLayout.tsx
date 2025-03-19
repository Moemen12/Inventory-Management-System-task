import { JSX } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";

const AuthLayout = (): JSX.Element => {
  const location = useLocation();
  const isLoginPage = location.pathname === "/";

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-[90%] sm:max-w-xl py-20 px-2 sm:px-10 bg-[#1E293B] rounded-xl shadow-lg">
        <Outlet />

        <div className="mt-6 text-center text-gray-400">
          {isLoginPage ? (
            <>
              Not registered yet?{" "}
              <Link
                to="/register"
                className="text-blue-500 hover:text-blue-400 font-medium transition duration-200"
              >
                Register here
              </Link>
            </>
          ) : (
            <>
              Already registered?{" "}
              <Link
                to="/"
                className="text-blue-500 hover:text-blue-400 font-medium transition duration-200"
              >
                Login here
              </Link>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default AuthLayout;
