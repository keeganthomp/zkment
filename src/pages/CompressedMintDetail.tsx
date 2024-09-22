import { useMintInfo } from "@/hooks/useMintInfo";
import { useParams } from "react-router-dom";
import { Loader } from "@/components/ui/loader";

const CompressedMintDetail = () => {
  const { mint } = useParams();
  const { isFetchingMintInfo, errorFetchingMintInfo, mintInfo, isAuthority } =
    useMintInfo(mint);

  if (isFetchingMintInfo) {
    return (
      <div className="flex justify-center items-center flex-col">
        <Loader className="w-6 h-6 text-gray-600" />
        <p className="text-gray-500 text-xs">Fetching Mint Info...</p>
      </div>
    );
  }

  if (errorFetchingMintInfo) {
    return (
      <p className="text-red-500 text-center font-light">
        Error fetching mint info
      </p>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-semibold text-gray-700 pb-7">
          Mint Detail
        </h1>
      </div>
      <div className="flex flex-col gap-3">
        <div>
          <p className="text-gray-800">Address</p>
          <p className="text-gray-500 font-light">{mintInfo?.address?.toBase58()}</p>
        </div>
        <div>
          <p className="text-gray-800">Decimals</p>
          <p className="text-gray-500 font-light">{mintInfo?.decimals}</p>
        </div>
        <div>
          <p className="text-gray-800">Supply</p>
          <p className="text-gray-500 font-light">{mintInfo?.supply?.toString()}</p>
        </div>
        <div>
          <p className="text-gray-800">Mint Authority</p>
          <p className="text-gray-500 font-light">
            {isAuthority ? "You" : mintInfo?.mintAuthority?.toBase58()}
          </p>
        </div>
      </div>
    </div>
  );
};

export default CompressedMintDetail;
