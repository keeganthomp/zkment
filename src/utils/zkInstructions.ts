import {
  getLightRpc,
  getMintRentExemption,
  deriveTokenPoolPda,
  deriveCpiAuthorityPda,
  getCompressedMintProgam,
} from "@/utils/zkCompression";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  createInitializeMintInstruction,
  createInitializeMint2Instruction,
  createInitializeMetadataPointerInstruction,
  TOKEN_2022_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  getMintLen,
  ExtensionType,
  MINT_SIZE,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import {
  createInitializeInstruction,
  createUpdateFieldInstruction,
  TokenMetadata,
} from "@solana/spl-token-metadata";
import { bn } from "@lightprotocol/stateless.js";
import {
  CompressedTokenProgram,
  selectMinCompressedTokenAccountsForTransfer,
} from "@lightprotocol/compressed-token";
import {
  getAssociatedTokenAddress,
  checkIfAtaExist,
  checkIfAccountExist,
} from "@/utils/solana";

export type BaseIxResponse = {
  instructions: TransactionInstruction[];
};

export type CreateZKMintIxArgs = {
  creator: PublicKey;
  authority?: PublicKey;
  decimals?: number;
  metadata?: TokenMetadata;
};

export type CreateZKTransferIxArgs = {
  owner: PublicKey;
  mint: PublicKey;
  amount: number;
  to: PublicKey;
};

export type CreateZKCompressIxArgs = {
  receiver: PublicKey;
  mint: PublicKey;
  amount: number;
  payer?: PublicKey;
};

export type CreateZKDecompressIxArgs = {
  owner: PublicKey;
  mint: PublicKey;
  amount: number;
};

export const createZKMintIx = async ({
  creator,
  authority,
  decimals = 9,
  metadata,
}: CreateZKMintIxArgs): Promise<BaseIxResponse & { mintKp: Keypair }> => {
  const mintKp = Keypair.generate();
  const mintAddress = mintKp.publicKey;
  const mintAuthority = authority ?? creator;
  const freezeAuthority = authority ?? creator;

  const lightRpc = getLightRpc();

  if (metadata) {
    console.log("Handling metadata mint...");
    const mintLen = getMintLen([ExtensionType.MetadataPointer]);

    // get rent exemption
    console.log("getting rent exemption...");
    const rentExemptBalance = await getMintRentExemption(metadata);

    /// Create and initialize SPL Mint account
    const createMintAccountIx = SystemProgram.createAccount({
      fromPubkey: creator,
      lamports: rentExemptBalance,
      newAccountPubkey: mintAddress,
      programId: TOKEN_2022_PROGRAM_ID,
      space: mintLen,
    });
    console.log("Deriving token pool pda...");

    // Instruction to initialize Mint Account data
    const initializeMintInstruction = createInitializeMintInstruction(
      mintAddress, // Mint Account Address
      decimals, // Decimals of Mint
      mintAuthority, // Designated Mint Authority
      freezeAuthority, // Optional Freeze Authority
      TOKEN_2022_PROGRAM_ID, // Token Extension Program ID
    );

    /////////////////////////////////
    // create metadata instructions
    /////////////////////////////////
    console.log("creating metadata instructions...");
    // Instruction to invoke System Program to create new account
    const initializeMetadataPointerInstruction =
      createInitializeMetadataPointerInstruction(
        mintAddress, // Mint Account address
        mintAuthority, // Authority that can set the metadata address
        mintAuthority, // Account address that holds the metadata
        TOKEN_2022_PROGRAM_ID,
      );
    // Instruction to initialize Metadata Account data
    const initializeMetadataInstruction = createInitializeInstruction({
      programId: TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
      metadata: mintAddress, // Account address that holds the metadata
      updateAuthority: mintAuthority, // Authority that can update the metadata
      mint: mintAddress, // Mint Account address
      mintAuthority: mintAuthority, // Designated Mint Authority
      name: metadata.name,
      symbol: metadata.symbol,
      uri: metadata.uri,
    });

    // Instruction to update metadata, adding custom field
    const updateFieldInstruction = createUpdateFieldInstruction({
      programId: TOKEN_2022_PROGRAM_ID, // Token Extension Program as Metadata Program
      metadata: mintAddress, // Account address that holds the metadata
      updateAuthority: mintAuthority, // Authority that can update the metadata
      field: metadata.additionalMetadata[0][0], // key
      value: metadata.additionalMetadata[0][1], // value
    });

    const createMintIxs = [
      createMintAccountIx,
      initializeMetadataPointerInstruction,
      ///////////////////////////////////////////
      // the above instructions MUST happen first
      ///////////////////////////////////////////
      initializeMintInstruction,
      initializeMetadataInstruction,
      updateFieldInstruction,
    ];

    return { instructions: createMintIxs, mintKp };
  } else {
    console.log("Handling non-metadata mint...");

    const rentExemptBalance =
      await lightRpc.getMinimumBalanceForRentExemption(MINT_SIZE);

    const createMintAccountInstruction = SystemProgram.createAccount({
      fromPubkey: creator,
      lamports: rentExemptBalance,
      newAccountPubkey: mintAddress,
      programId: TOKEN_PROGRAM_ID,
      space: MINT_SIZE,
    });

    const initializeMintInstruction = createInitializeMint2Instruction(
      mintAddress,
      decimals,
      mintAuthority,
      freezeAuthority,
      TOKEN_PROGRAM_ID,
    );

    // create token pool info to enable compressiong
    const tokenPoolPda = deriveTokenPoolPda(mintAddress);
    const compressedMintProgram = getCompressedMintProgam(creator);
    // create token pool instructions
    console.log("Creating token pool instructions...");
    const createTokenPoolIx = await compressedMintProgram.methods
      .createTokenPool()
      .accounts({
        mint: mintAddress,
        feePayer: creator,
        tokenPoolPda,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        cpiAuthorityPda: deriveCpiAuthorityPda(),
      })
      .instruction();

    const mintInitialIx = await CompressedTokenProgram.mintTo({
      feePayer: creator,
      mint: mintAddress,
      authority: mintAuthority,
      amount: 0,
      toPubkey: creator,
    });

    const createMintIxs = [
      createMintAccountInstruction,
      initializeMintInstruction,
      createTokenPoolIx,
      mintInitialIx,
    ];

    return { instructions: createMintIxs, mintKp };
  }
};

export const createZKTransferIx = async ({
  owner,
  mint,
  amount,
  to,
}: CreateZKTransferIxArgs): Promise<BaseIxResponse> => {
  const lightRpc = getLightRpc();

  const tokAmount = bn(amount);

  console.log("getting compressed token accounts...");
  const compressedTokenAccounts =
    await lightRpc.getCompressedTokenAccountsByOwner(owner, {
      mint,
    });
  const [inputAccounts] = selectMinCompressedTokenAccountsForTransfer(
    compressedTokenAccounts.items,
    tokAmount,
  );

  console.log("getting validity proof...");
  const proof = await lightRpc.getValidityProof(
    inputAccounts.map((account) => bn(account.compressedAccount.hash)),
  );

  console.log("transferring compressed tokens...");
  const ix = await CompressedTokenProgram.transfer({
    payer: owner,
    inputCompressedTokenAccounts: inputAccounts,
    toAddress: to,
    amount: tokAmount,
    recentInputStateRootIndices: proof.rootIndices,
    recentValidityProof: proof.compressedProof,
    //   outputStateTrees: merkleTree,
  });

  return { instructions: [ix] };
};

export const createCompressTokenIx = async ({
  receiver,
  mint,
  amount,
  payer = receiver,
}: CreateZKCompressIxArgs): Promise<BaseIxResponse & { ata: PublicKey }> => {
  const originalAta = getAssociatedTokenAddress({
    owner: receiver,
    mint,
  });

  const tokenPoolPda = deriveTokenPoolPda(mint);
  const doesPoolPDAExist = await checkIfAccountExist(tokenPoolPda);

  const instructions: TransactionInstruction[] = [];

  // if the pool pda does not exist, create it
  if (!doesPoolPDAExist) {
    // create token pool info to enable compressiong
    const compressedMintProgram = getCompressedMintProgam(receiver);
    // create token pool instructions
    console.log("Creating token pool instructions...");
    const createTokenPoolIx = await compressedMintProgram.methods
      .createTokenPool()
      .accounts({
        mint,
        feePayer: payer,
        tokenPoolPda,
        systemProgram: SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
        cpiAuthorityPda: deriveCpiAuthorityPda(),
      })
      .instruction();
    instructions.push(createTokenPoolIx);
  }

  if (!originalAta) {
    throw new Error("Original ATA not found - create it?");
  }

  const compressIx = await CompressedTokenProgram.compress({
    payer,
    owner: receiver,
    source: originalAta,
    toAddress: receiver,
    amount,
    mint,
  });
  instructions.push(compressIx);

  return { instructions, ata: originalAta };
};

export const createDecompressTokenIx = async ({
  owner,
  mint,
  amount,
}: CreateZKDecompressIxArgs): Promise<BaseIxResponse & { ata: PublicKey }> => {
  const lightRpc = getLightRpc();

  const { ata, isValid: isAtaValid } = await checkIfAtaExist({ owner, mint });

  const instructions: TransactionInstruction[] = [];

  if (!isAtaValid) {
    const createAtaIx = createAssociatedTokenAccountInstruction(
      owner,
      ata,
      owner,
      mint,
    );
    instructions.push(createAtaIx);
  }

  const { items: compressedTokenAccounts } =
    await lightRpc.getCompressedTokenAccountsByOwner(owner, {
      mint,
    });

  const [inputAccounts] = selectMinCompressedTokenAccountsForTransfer(
    compressedTokenAccounts,
    amount,
  );

  const proof = await lightRpc.getValidityProof(
    inputAccounts.map((account) => bn(account.compressedAccount.hash)),
  );

  // 4. Create the decompress instruction
  const decompressIx = await CompressedTokenProgram.decompress({
    payer: owner,
    inputCompressedTokenAccounts: inputAccounts,
    toAddress: ata,
    amount,
    recentInputStateRootIndices: proof.rootIndices,
    recentValidityProof: proof.compressedProof,
  });

  instructions.push(decompressIx);

  return { instructions, ata };
};
