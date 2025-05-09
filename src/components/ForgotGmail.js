import React, { useState, useEffect } from "react";
import styles from "./ForgotGmail.module.css";
import { sendMail } from "../services/MailService";
import { findUserByMail } from "../services/UserService";
import { useNavigate } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";

const ForgotGmail = () => {
  const [username, setUsername] = useState("");
  const [stage, setStage] = useState("input");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [timer, setTimer] = useState(120);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let countdown;
    if (stage === "otp" && timer > 0) {
      countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(countdown);
  }, [stage, timer]);

  const generateOtp = () => Math.floor(1000 + Math.random() * 9000).toString();

  const handleSendOtp = async () => {
    try {
      const foundUser = await findUserByMail(username);
      if (!foundUser) {
        setMessage({ text: "User doesn't exist.", type: "error" });
        return;
      }

      const otpToSend = generateOtp();
      setGeneratedOtp(otpToSend);
      setTimer(120);
      setStage("otp");
      setOtp("");
      setMessage({ text: "", type: "success" });
      setUser(foundUser);

      const emailDto = {
        to: username,
        subject: "Medicure - OTP Verification",
        text: `Your OTP is ${otpToSend}. It is valid for 2 minutes.`,
      };

      await sendMail(emailDto);
    } catch (error) {
      console.error("Error:", error);
      setMessage({
        text: "Something went wrong. Please try again.",
        type: "error",
      });
    }
  };

  const handleVerifyOtp = () => {
    if (timer <= 0) {
      setMessage({
        text: "OTP has expired. Please request a new one.",
        type: "error",
      });
    } else if (otp !== generatedOtp) {
      setMessage({
        text: "The OTP you entered is incorrect. Please try again.",
        type: "error",
      });
    } else {
      localStorage.setItem("logged_user", JSON.stringify(user));
      setStage("success");
      setMessage({
        text: "OTP verified successfully! Redirecting...",
        type: "success",
      });

      setTimeout(() => navigate("/user/home"), 2000);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <Navbar></Navbar>
      <div className={styles.containerOuter}>
        <div className={styles.container}>
          <h1 className={styles.heading}>Forgot Gmail</h1>

          {stage === "input" && (
            <>
              <p className={styles.description}>
                Enter your Gmail to receive an OTP.
              </p>
              <input
                type="email"
                placeholder="Enter Gmail"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={styles.input}
              />
              <button
                onClick={handleSendOtp}
                disabled={!username}
                className={styles.button}
              >
                Send OTP
              </button>
            </>
          )}

          {stage === "otp" && (
            <>
              <p className={styles.description}>
                Time left: <strong>{formatTime(timer)}</strong>
                <br></br>Enter the OTP sent to your email.
              </p>
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className={styles.input}
              />
              <button
                onClick={handleVerifyOtp}
                disabled={!otp}
                className={styles.button}
              >
                Verify OTP
              </button>
              <button onClick={handleSendOtp} className={styles.retryButton}>
                Resend OTP
              </button>
            </>
          )}

          {stage === "success" && (
            <p className={styles.success}>OTP verified successfully!</p>
          )}

          {message.text && (
            <div
              className={`${styles.messagePopup} ${
                message.type === "error" ? styles.error : styles.successMsg
              }`}
            >
              {message.text}
            </div>
          )}
        </div>
      </div>
      <Footer></Footer>
    </>
  );
};

export default ForgotGmail;

// khushipatel134040@gmail.com
