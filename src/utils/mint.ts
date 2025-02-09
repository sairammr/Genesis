import { ethers, Contract, ContractTransactionReceipt, EventLog, BrowserProvider } from 'ethers';

// Types and Interfaces
interface MintResult {
    success: boolean;
    transactionHash?: string;
    tokenId?: string;
    error?: string;
}

interface NFTContractConfig {
    contractAddress: string;
    provider: BrowserProvider;
}

// Contract ABI with explicit types
interface NFTABI extends ethers.BaseContract {
    mintNFT(recipient: string, tokenURI: string, overrides?: { value: bigint }): Promise<any>;
    tokenURI(tokenId: number): Promise<string>;
    ownerOf(tokenId: number): Promise<string>;
    balanceOf(address: string): Promise<bigint>;
}

// Contract ABI
const contractABI = [
    "function mintNFT(address recipient, string memory tokenURI) public payable returns (uint256)",
    "function tokenURI(uint256 tokenId) public view returns (string memory)",
    "function ownerOf(uint256 tokenId) public view returns (address)",
    "function balanceOf(address owner) public view returns (uint256)"
] as const;

class NFTContractService {
    private contract: NFTABI;
    private provider: BrowserProvider;

    constructor({ contractAddress, provider }: NFTContractConfig) {
        this.provider = provider;
        this.contract = new Contract(
            contractAddress,
            contractABI,
            provider
        ) as unknown as NFTABI;
    }

    async mintNFT(recipientAddress: string, metadataURI: string): Promise<MintResult> {
        try {
            const signer = await this.provider.getSigner();
            const contractWithSigner = this.contract.connect(signer) as NFTABI;

            // Mint price is 0.01 ETH
            const mintPrice = ethers.parseEther("0.01");

            const tx = await contractWithSigner.mintNFT(
                recipientAddress,
                metadataURI,
                {
                    value: mintPrice
                }
            );

            const receipt = await tx.wait() as ContractTransactionReceipt;
            
            const event = (receipt.logs?.find(
                log => log instanceof EventLog && log.eventName === 'Transfer'
            ) as EventLog | undefined);

            const tokenId = event?.args?.tokenId;

            return {
                success: true,
                transactionHash: receipt.hash,
                tokenId: tokenId?.toString()
            };
        } catch (error) {
            console.error("Error minting NFT:", error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }

    async getTokenURI(tokenId: number): Promise<string> {
        try {
            const uri = await this.contract.tokenURI(tokenId);
            return uri;
        } catch (error) {
            console.error("Error getting token URI:", error);
            throw error;
        }
    }

    async getOwner(tokenId: number): Promise<string> {
        try {
            const owner = await this.contract.ownerOf(tokenId);
            return owner;
        } catch (error) {
            console.error("Error getting token owner:", error);
            throw error;
        }
    }

    async getNFTBalance(address: string): Promise<string> {
        try {
            const balance = await this.contract.balanceOf(address);
            return balance.toString();
        } catch (error) {
            console.error("Error getting NFT balance:", error);
            throw error;
        }
    }
}

// React component types
interface NFTMintingProps {
    onSuccess?: (result: MintResult) => void;
    onError?: (error: Error) => void;
}

// Fixed ethereum window type
declare global {
    interface Ethereum {
        request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
        on: (event: string, callback: (params: unknown) => void) => void;
        removeListener: (event: string, callback: (params: unknown) => void) => void;
        isMetaMask?: boolean;
    }

    interface Window {
        ethereum?: any;
    }
}

// Example usage with React
const useNFTMinting = ({ onSuccess, onError }: NFTMintingProps = {}) => {
    const handleMintNFT = async (metadataURI: string): Promise<void> => {
        try {
            // Type guard for ethereum window object
            if (!window.ethereum) {
                throw new Error("Please install MetaMask!");
            }

            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            }) as string[];
            
            const userAddress = accounts[0];

            const provider = new ethers.BrowserProvider(window.ethereum);
            const nftService = new NFTContractService({
                contractAddress: process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || '',
                provider
            });

            const result = await nftService.mintNFT(userAddress, metadataURI);
            
            if (result.success) {
                console.log("NFT Minted Successfully!");
                console.log("Transaction Hash:", result.transactionHash);
                console.log("Token ID:", result.tokenId);
                onSuccess?.(result);
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error("Error in handleMintNFT:", error);
            if (error instanceof Error) {
                onError?.(error);
            }
            throw error;
        }
    };

    return { handleMintNFT };
};

export { NFTContractService, useNFTMinting, type MintResult, type NFTMintingProps };