import { Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth } from "../features/auth/components/RequireAuth";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { AppLayout } from "../shared/layout/AppLayout";
import { CatalogPage } from "../features/catalog/pages/CatalogPage";
import { HistoryPage } from "../features/history/pages/HistoryPage";
import { SettingsPage } from "../features/settings/pages/SettingsPage";
import { HistoryDetailPage } from "../features/history/pages/HistoryDetailPage";

export function AppRoutes() {
    return (
        <Routes>
            {/* Pública */}
            <Route path="/login" element={<LoginPage />} />

            {/* Privada: aquí es donde existe Header/Sidebar */}
            <Route
                path="/"
                element={
                    <RequireAuth>
                        <AppLayout />
                    </RequireAuth>
                }
            >
                <Route index element={<CatalogPage />} />
                <Route path="history" element={<HistoryPage />} />
                <Route path="history/:id" element={<HistoryDetailPage />} />
                <Route path="settings" element={<SettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
