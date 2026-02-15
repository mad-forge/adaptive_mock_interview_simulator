import { lazy, Suspense } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const LoginPage = lazy(() => import("../pages/loginPage"));
const SetupPage = lazy(() => import("../pages/setupPage"));
const SessionPage = lazy(() => import("../pages/sessionPage"));
const ReportPage = lazy(() => import("../pages/reportPage"));
const HistoryPage = lazy(() => import("../pages/historyPage"));

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useSelector((state) => state.Auth);
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }
    return children;
};

const PagesRoute = () => {
    return (
        <Suspense fallback={<></>}>
            <Routes>
                <Route path="/" element={<LoginPage />} />
                <Route
                    path="/setup"
                    element={
                        <ProtectedRoute>
                            <SetupPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/session"
                    element={
                        <ProtectedRoute>
                            <SessionPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/report"
                    element={
                        <ProtectedRoute>
                            <ReportPage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/history"
                    element={
                        <ProtectedRoute>
                            <HistoryPage />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Suspense>
    );
};

export default PagesRoute;
