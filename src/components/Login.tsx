// src/components/Login.tsx
import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { auth } from "../firebase/config";

// Định nghĩa props mà component này nhận
interface LoginProps {
  onLogin: (userId: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleLogin = async () => {
      setLoading(true);
      try {
        // Đăng nhập ẩn danh
        await signInAnonymously(auth);

        // Lắng nghe trạng thái đăng nhập để lấy userId
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            onLogin(user.uid);
          }
        });
        return () => unsubscribe();
      } catch (error) {
        console.error("Lỗi đăng nhập:", error);
        setErrorMessage("Lỗi: Không thể đăng nhập. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    handleLogin();
  }, [onLogin]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4 font-sans">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Đăng Nhập</h2>
        {loading ? (
          <>
            <p className="text-gray-600 mb-6">
              Vui lòng đợi, chúng tôi đang kết nối với hệ thống.
            </p>
            <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 h-full w-full bg-indigo-500 animate-pulse"></div>
            </div>
          </>
        ) : (
          <p className="text-green-600 font-medium">Đăng nhập thành công!</p>
        )}
        {errorMessage && (
          <p className="mt-4 text-red-600 font-medium">{errorMessage}</p>
        )}
      </div>
    </div>
  );
};

export default Login;
