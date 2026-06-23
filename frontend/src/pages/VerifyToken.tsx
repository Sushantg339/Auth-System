import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import api from "../lib/axios";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const Verify = () => {
  const { token } = useParams();

  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);

  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;

    hasRun.current = true;

    const verifyUser = async () => {
      try {
        const res = await api.post(`/user/verify/${token}`);

        toast.success(res.data.message);
        setVerified(true);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Verification failed");
        setVerified(false);
      } finally {
        setLoading(false);
      }
    };

    verifyUser();
  }, [token]);

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 to-blue-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md text-center">
        {loading ? (
          <>
            <div className="mx-auto h-14 w-14 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <h1 className="text-2xl font-bold text-gray-800 mt-6">
              Verifying Email
            </h1>
            <p className="text-gray-500 mt-2">
              Please wait while we verify your account...
            </p>
          </>
        ) : verified ? (
          <>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
              <svg
                className="h-8 w-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mt-6">
              Email Verified 🎉
            </h1>

            <p className="text-gray-500 mt-2">
              Your account has been successfully verified.
            </p>

            <Link
              to="/login"
              className="inline-block mt-6 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition"
            >
              Continue to Login
            </Link>
          </>
        ) : (
          <>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
              <svg
                className="h-8 w-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={3}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-gray-800 mt-6">
              Verification Failed
            </h1>

            <p className="text-gray-500 mt-2">
              The verification link is invalid or has expired.
            </p>

            <Link
              to="/signup"
              className="inline-block mt-6 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition"
            >
              Go to Signup
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default Verify;
