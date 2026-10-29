import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import ChatWidget from "../ui/ChatWidget";

export default function Layout() {
  return (
    <div className="min-h-screen bg-ink">
      <Navbar />
      <Outlet />
      <Footer />
      <ChatWidget />
    </div>
  );
}
