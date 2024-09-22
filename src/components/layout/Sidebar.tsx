import { NavLink } from "react-router-dom";
import ConnectWalletButton from "@/components/ConnectWalletButton";
import {
  getEnvironment,
  setEnvironment,
  Environment,
} from "@/utils/environment";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Link = ({ to, label }: { to: string; label: string }) => {
  return (
    <NavLink
      className={({ isActive }) =>
        isActive
          ? "h-11 px-2 text-lg flex items-center font-semibold rounded-sm font-light"
          : "h-11 px-2 text-lg flex items-center bg-transparent hover:font-normal rounded-sm font-thin"
      }
      to={to}
    >
      {label}
    </NavLink>
  );
};

const NetworkSelect = () => {
  const environment = getEnvironment();
  const isDevelopment = import.meta.env.MODE === "development";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="w-full  bg-gray-50 hover:bg-gray-100 py-2 rounded font-light">
        {environment.charAt(0).toUpperCase() + environment.slice(1)}
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Network</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isDevelopment && (
          <DropdownMenuItem onClick={() => setEnvironment(Environment.LOCAL)}>
            Local
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => setEnvironment(Environment.DEVNET)}>
          Devnet
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setEnvironment(Environment.MAINNET)}>
          Mainnet
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const Sidebar = () => {
  return (
    <div className="w-46 flex-shrink-0 shadow-md bg-white min-w-[175px] flex flex-col gap-6 pb-5 py-5 relative">
      <div className="flex flex-col gap-0 justify-center items-center relative">
        <h1 className="text-2xl tracking-[1px] uppercase font-bold text-gray-700">
          ZKMent
        </h1>
        <p className="text-[9px] uppercase font-thin tracking-[2px] relative top-[-4px]">
          Compression First
        </p>
      </div>
      <ConnectWalletButton />
      <nav className="flex flex-col gap-1 px-2">
        <Link to="/" label="Tokens" />
        <Link to="/reclaim" label="Compress" />
        <Link to="/create-mint" label="Create Mint" />
        <Link to="/tx" label="Transactions" />
      </nav>
      <div className="absolute bottom-4 left-0 w-full px-2">
        <NetworkSelect />
      </div>
    </div>
  );
};

export default Sidebar;
