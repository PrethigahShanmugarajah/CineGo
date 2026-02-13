import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api/axios";
import API_ROUTES from "../../api/api_route";
import { toast } from "react-toastify";

const VerifyPayment = () => {
  const [statusMsg, setStausMsg] = useState("Verify Payment...");
  const navigate = useNavigate();
  const location = useLocation();
  const search = location.search || "";

  useEffect(() => {
    let cancelled = false;

    const verifyPayment = async () => {
      const params = new URLSearchParams(search);

      const rawSession = params.get("session_id");
      const session_id = rawSession ? rawSession.trim() : null;
      const payment_status = params.get("payment_status");
      const token = localStorage.getItem("token");

      if (payment_status === "cancel") {
        navigate("/", { replace: true });
        return;
      }

      if (!session_id) {
        setStausMsg("No session_id provided in the URL.");
        return;
      }

      try {
        setStausMsg("Confirming payment with server.");
        const response = await api.get(
          API_ROUTES.BOOKING.BOOKING_CONFIRM_PAYMENT,
          {
            params: { session_id },
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            timeout: 15000,
          },
        );

        // console.log("Confirm Payment API Response:", response);

        if (cancelled) return;

        if (response?.data?.success) {
          toast.success(response?.data?.message);
          // console.log("Confirm Payment Success:", response?.data?.message);

          setStausMsg("Payment confirmed. Redirecting...");
          navigate("/bookings", { replace: true });
          return;
        } else {
          toast.warn(response?.data?.message);
          console.warn("Confirm Payment Data Error:", response?.data?.message);

          setStausMsg(response?.data?.message || "Payment not completed.");
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || error?.message);
        console.log("Confirm Payment Error:", error);

        const status = error?.response?.status;
        const serverMsg = error?.response?.data?.message;

        if (status === 404) {
          setStausMsg(
            serverMsg ||
              "Payment session not found. If you were charged, contact support with your session id.",
          );
        } else if (status === 400) {
          setStausMsg(
            serverMsg || "Payment not completed or invalid requests.",
          );
        } else {
          setStausMsg(
            serverMsg ||
              "There was an error confirming payment. If you were charged, please contact support.",
          );
        }
      }
    };

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [search, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center text-white p-4">
      <div className="text-center max-w-lg">
        <p className="mb-2">{statusMsg}</p>
        <p className="text-sm opacity-70">
          If this page shows 'session not found', try copying the 'sessuon_id'
          from your browser URL and verify it with your backend logs contact
          support.
        </p>
      </div>
    </div>
  );
};

export default VerifyPayment;
