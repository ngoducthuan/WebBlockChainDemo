import React, { useState } from "react";
import { sendFunds } from "../contracts/SafeWallet"; // Import hàm từ contracts
import "bootstrap/dist/css/bootstrap.min.css";

function SendFunds() {
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");
    const [message, setMessage] = useState("");

    const handleSend = async () => {
        if (!recipient || !amount) {
            setMessage("Vui lòng nhập địa chỉ và số tiền!");
            return;
        }

        try {
            const resultMessage = await sendFunds(recipient, amount);
            setMessage(resultMessage);
        } catch (error) {
            setMessage("Lỗi: " + error.message);
        }
    };

    return (
        <div className="d-flex flex-column align-items-center">
            <h1 style={{ marginBottom: "50px", marginTop: "60px" }}>Ứng dụng Blockchain</h1>
            <div className="card p-4 shadow-lg" style={{ width: "400px" }}>
                <h2 className="text-center text-primary">Ví Crypto</h2>

                <div className="mb-3">
                    <label className="form-label">Địa chỉ nhận:</label>
                    <input
                        type="text"
                        className="form-control"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        placeholder="0x..."
                    />
                </div>

                <div className="mb-3">
                    <label className="form-label">Số lượng ETH:</label>
                    <input
                        type="number"
                        className="form-control"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Nhập số ETH"
                        step="0.01"
                    />
                </div>

                <div className="d-flex justify-content-center">
                    <button 
                        className="btn btn-primary btn-sm" 
                        style={{ width: "80px", height: "40px" }} 
                        onClick={handleSend}
                    >
                        Gửi ETH
                    </button>
                </div>

                {message && (
                    <p className={`alert mt-3 ${message.startsWith("Giao dịch thành công") ? "alert-success" : "alert-danger"}`}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}

export default SendFunds;