import { NavLink } from "react-router-dom";
import ConnectWalletButton from "@/components/ConnectWalletButton";

const Link = ({ to, label }: { to: string; label: string }) => {
  return (
    <NavLink
      className={({ isActive }) =>
        isActive
          ? "h-8 px-2 flex items-center font-semibold rounded-sm font-light"
          : "h-8 px-2 flex items-center bg-transparent hover:font-normal rounded-sm font-thin"
      }
      to={to}
    >
      {label}
    </NavLink>
  );
};

const Sidebar = () => {
  return (
    <div className="w-46 flex-shrink-0 shadow-md bg-white min-w-[175px] flex flex-col gap-4 py-5">
      <ConnectWalletButton />
      <nav className="flex flex-col gap-1 px-2">
        <Link to="/" label="Wallet" />
        <Link to="/create-mint" label="Create Mint" />
        <Link to="/reclaim" label="Reclaim" />
        <Link to="/tx" label="Transactions" />
      </nav>
    </div>
  );
};

export default Sidebar;
