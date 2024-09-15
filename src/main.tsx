import "./index.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import WalletProvider from "./context/walletContext";
import { ZKCompressionProvider } from "./context/zkCompressionContext";
import { TokenBalancesProvider } from "./context/tokenBalancesContext";
import Sidebar from "./components/layout/Sidebar";

import Home from "./Home";
import CreateMint from "./CreateMint";
import Transactions from "./Transactions";
import Reclaim from "./Reclaim";

const AppLayout = () => (
  <div className="flex h-screen overflow-hidden">
    <Sidebar />
    <main className="flex-grow overflow-auto px-7 py-4 bg-gray-50">
      <Outlet />
    </main>
  </div>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "/reclaim",
        element: <Reclaim />,
      },
      {
        path: "/create-mint",
        element: <CreateMint />,
      },
      {
        path: "/transactions",
        element: <Transactions />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WalletProvider>
      <ZKCompressionProvider>
        <TokenBalancesProvider>
          <RouterProvider router={router} />
        </TokenBalancesProvider>
      </ZKCompressionProvider>
    </WalletProvider>
    <Toaster />
  </StrictMode>,
);
