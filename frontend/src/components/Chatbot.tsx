import { useState, useRef, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  IconButton,
  TextField,
  Fab,
  Avatar,
  Slide,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  AutoAwesome as SparkleIcon,
} from "@mui/icons-material";

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<
    { sender: "user" | "bot"; text: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fabPulse, setFabPulse] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isOpen]);

  useEffect(() => {
    const timer = setTimeout(() => setFabPulse(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message;
    setChatHistory((prev) => [...prev, { sender: "user", text: userMessage }]);
    setMessage("");
    setIsLoading(true);

    try {
      const role = localStorage.getItem("role") || "";
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage, role }),
      });

      const data = await response.json();
      const botReply = data.response || "Sorry, I am offline.";

      setChatHistory((prev) => [...prev, { sender: "bot", text: botReply }]);
    } catch (error) {
      setChatHistory((prev) => [
        ...prev,
        { sender: "bot", text: "I'm having trouble connecting to the server." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const colors = {
    headerBg: isDark
      ? "linear-gradient(135deg, #070E1A 0%, #0A1624 100%)"
      : "linear-gradient(135deg, #053F4A 0%, #065A68 100%)",
    chatBg: isDark ? "#0A1624" : "#F3EEE6",
    inputAreaBg: isDark ? "#070E1A" : "#FFFFFF",
    paperBorder: isDark
      ? "rgba(20, 163, 180, 0.22)"
      : "rgba(10, 112, 128, 0.25)",
    paperBg: isDark ? "#0D1D30" : "#FFFFFF",
    userBubbleBg: isDark
      ? "linear-gradient(135deg, #0A7080, #3A5491)"
      : "linear-gradient(135deg, #0A7080, #065A68)",
    userBubbleText: "#FFFFFF",
    botBubbleBg: isDark ? "#11253D" : "#FFFFFF",
    botBubbleText: isDark ? "#EEF4FA" : "#1C1208",
    botBubbleBorder: isDark
      ? "rgba(20, 163, 180, 0.18)"
      : "rgba(10, 112, 128, 0.15)",
    avatarBotBg: isDark ? "#0A7080" : "#065A68",
    avatarUserBg: isDark
      ? "linear-gradient(135deg, #14A3B4, #5E78B8)"
      : "linear-gradient(135deg, #0A7080, #3A5491)",
    fabBg: isDark
      ? "linear-gradient(135deg, #14A3B4 0%, #5E78B8 100%)"
      : "linear-gradient(135deg, #0A7080 0%, #3A5491 100%)",
    fabGlow: isDark
      ? "0 8px 32px rgba(20, 163, 180, 0.45)"
      : "0 8px 32px rgba(10, 112, 128, 0.40)",
    accent: isDark ? "#4ECBD8" : "#0A7080",
    accentLight: isDark
      ? "rgba(20, 163, 180, 0.15)"
      : "rgba(10, 112, 128, 0.08)",
    divider: isDark ? "rgba(20, 163, 180, 0.12)" : "rgba(10, 112, 128, 0.12)",
    inputBg: isDark ? "#0D1D30" : "#FAF7F2",
    inputBorder: isDark
      ? "rgba(20, 163, 180, 0.22)"
      : "rgba(10, 112, 128, 0.22)",
    inputBorderHover: isDark ? "#14A3B4" : "#0A7080",
    scrollbarThumb: isDark
      ? "rgba(20, 163, 180, 0.25)"
      : "rgba(10, 112, 128, 0.20)",
    onlineIndicator: "#5CB87A",
    emptyIconColor: isDark ? "#4ECBD8" : "#0A7080",
    emptySubtext: isDark
      ? "rgba(238, 244, 250, 0.50)"
      : "rgba(28, 18, 8, 0.50)",
    headerShadow: isDark
      ? "0 1px 0 rgba(20, 163, 180, 0.10)"
      : "0 1px 0 rgba(10, 112, 128, 0.12)",
  };

  const drawerShadow = isDark
    ? "0 24px 64px rgba(0,0,0,0.70), 0 0 0 1px rgba(20,163,180,0.14)"
    : "0 24px 64px rgba(5,63,74,0.22), 0 0 0 1px rgba(10,112,128,0.14)";

  return (
    <>
      <style>{`
        @keyframes chatbot-pulse {
          0%, 100% { box-shadow: ${colors.fabGlow}; }
          50% { box-shadow: 0 8px 48px ${isDark ? "rgba(20, 163, 180, 0.75)" : "rgba(10, 112, 128, 0.65)"}; transform: scale(1.05); }
        }
        @keyframes chatbot-bounce-in {
          0% { opacity: 0; transform: translateY(10px) scale(0.95); }
          60% { transform: translateY(-3px) scale(1.01); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes chatbot-typing-dot {
          0%, 80%, 100% { transform: scale(0.55); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @keyframes chatbot-shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .chatbot-message-in {
          animation: chatbot-bounce-in 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .chatbot-typing-dot:nth-child(1) { animation: chatbot-typing-dot 1.2s infinite 0s; }
        .chatbot-typing-dot:nth-child(2) { animation: chatbot-typing-dot 1.2s infinite 0.2s; }
        .chatbot-typing-dot:nth-child(3) { animation: chatbot-typing-dot 1.2s infinite 0.4s; }
      `}</style>

      <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>
        <Paper
          elevation={0}
          sx={{
            position: "fixed",
            bottom: isMobile ? 0 : 96,
            right: isMobile ? 0 : 24,
            left: isMobile ? 0 : "auto",
            width: isMobile ? "100%" : 400,
            height: isMobile ? "85dvh" : 580,
            zIndex: 1250,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderRadius: isMobile ? "20px 20px 0 0" : "20px",
            bgcolor: colors.paperBg,
            boxShadow: drawerShadow,
            border: `1px solid ${colors.paperBorder}`,
          }}
        >
          <Box
            sx={{
              p: "14px 16px",
              background: colors.headerBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: `1px solid rgba(255,255,255,0.07)`,
              boxShadow: colors.headerShadow,
              flexShrink: 0,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{ position: "relative" }}>
                <Avatar
                  sx={{
                    background: "rgba(255,255,255,0.15)",
                    backdropFilter: "blur(8px)",
                    width: 40,
                    height: 40,
                    border: "1.5px solid rgba(255,255,255,0.20)",
                  }}
                >
                  <BotIcon sx={{ fontSize: 22, color: "#FFFFFF" }} />
                </Avatar>
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 1,
                    right: 1,
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: colors.onlineIndicator,
                    border: "2px solid #053F4A",
                    boxShadow: `0 0 6px ${colors.onlineIndicator}`,
                  }}
                />
              </Box>
              <Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                  <Typography
                    sx={{
                      fontFamily: '"Cormorant Garamond", Georgia, serif',
                      fontWeight: 600,
                      fontSize: "1.05rem",
                      color: "#FFFFFF",
                      letterSpacing: "0.02em",
                      lineHeight: 1.2,
                    }}
                  >
                    AMI AI
                  </Typography>
                  <SparkleIcon
                    sx={{ fontSize: 14, color: "rgba(255,255,255,0.65)" }}
                  />
                </Box>
                <Typography
                  sx={{
                    fontFamily: '"Jost", sans-serif',
                    fontSize: "0.70rem",
                    fontWeight: 400,
                    letterSpacing: "0.06em",
                    color: "rgba(255,255,255,0.60)",
                    textTransform: "uppercase",
                  }}
                >
                  Online · Hotel Concierge
                </Typography>
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={() => setIsOpen(false)}
              sx={{
                color: "rgba(255,255,255,0.55)",
                width: 32,
                height: 32,
                "&:hover": {
                  color: "#FFFFFF",
                  bgcolor: "rgba(255,255,255,0.12)",
                },
                transition: "all 0.2s ease",
              }}
            >
              <CloseIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          <Box
            sx={{
              flex: 1,
              p: "16px 14px",
              overflowY: "auto",
              overflowX: "hidden",
              display: "flex",
              flexDirection: "column",
              gap: 1.5,
              bgcolor: colors.chatBg,
              "&::-webkit-scrollbar": { width: 4 },
              "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: colors.scrollbarThumb,
                borderRadius: 4,
              },
            }}
          >
            {chatHistory.length === 0 && (
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 4,
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: "20px",
                    background: isDark
                      ? "linear-gradient(135deg, rgba(20,163,180,0.18), rgba(78,203,216,0.10))"
                      : "linear-gradient(135deg, rgba(10,112,128,0.12), rgba(10,112,128,0.06))",
                    border: `1.5px solid ${isDark ? "rgba(20,163,180,0.25)" : "rgba(10,112,128,0.20)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: isDark
                      ? "0 8px 24px rgba(20,163,180,0.12)"
                      : "0 8px 24px rgba(10,112,128,0.10)",
                  }}
                >
                  <BotIcon
                    sx={{ fontSize: 36, color: colors.emptyIconColor }}
                  />
                </Box>
                <Box sx={{ textAlign: "center", px: 2 }}>
                  <Typography
                    sx={{
                      fontFamily: '"Cormorant Garamond", Georgia, serif',
                      fontWeight: 400,
                      fontSize: "1.2rem",
                      color: isDark ? "#EEF4FA" : "#1C1208",
                      letterSpacing: "0.02em",
                      mb: 0.5,
                    }}
                  >
                    Welcome to AMI Hotel
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: '"Jost", sans-serif',
                      fontSize: "0.80rem",
                      fontWeight: 300,
                      color: colors.emptySubtext,
                      lineHeight: 1.7,
                    }}
                  >
                    Ask me about room availability,
                    <br />
                    pricing, or hotel amenities.
                  </Typography>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 0.8,
                    justifyContent: "center",
                    mt: 0.5,
                  }}
                >
                  {["Room availability", "Check-in info", "Amenities"].map(
                    (prompt) => (
                      <Box
                        key={prompt}
                        onClick={() => setMessage(prompt)}
                        sx={{
                          px: 1.4,
                          py: 0.55,
                          borderRadius: "20px",
                          border: `1px solid ${isDark ? "rgba(20,163,180,0.28)" : "rgba(10,112,128,0.25)"}`,
                          bgcolor: colors.accentLight,
                          cursor: "pointer",
                          fontFamily: '"Jost", sans-serif',
                          fontSize: "0.72rem",
                          fontWeight: 500,
                          letterSpacing: "0.03em",
                          color: colors.accent,
                          transition: "all 0.18s ease",
                          "&:hover": {
                            bgcolor: isDark
                              ? "rgba(20,163,180,0.22)"
                              : "rgba(10,112,128,0.13)",
                            borderColor: colors.accent,
                            transform: "translateY(-1px)",
                          },
                        }}
                      >
                        {prompt}
                      </Box>
                    ),
                  )}
                </Box>
              </Box>
            )}

            {chatHistory.map((msg, index) => (
              <Box
                key={index}
                className="chatbot-message-in"
                sx={{
                  display: "flex",
                  justifyContent:
                    msg.sender === "user" ? "flex-end" : "flex-start",
                  alignItems: "flex-end",
                  gap: 1,
                }}
              >
                {msg.sender === "bot" && (
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      bgcolor: colors.avatarBotBg,
                      flexShrink: 0,
                      mb: 0.3,
                      border: `1.5px solid ${isDark ? "rgba(20,163,180,0.30)" : "rgba(10,112,128,0.25)"}`,
                    }}
                  >
                    <BotIcon sx={{ fontSize: 15, color: "#FFFFFF" }} />
                  </Avatar>
                )}

                <Box
                  sx={{
                    maxWidth: "78%",
                    px: 1.6,
                    py: 1.1,
                    borderRadius:
                      msg.sender === "user"
                        ? "16px 16px 4px 16px"
                        : "16px 16px 16px 4px",
                    background:
                      msg.sender === "user" ? colors.userBubbleBg : "none",
                    bgcolor:
                      msg.sender === "user" ? "unset" : colors.botBubbleBg,
                    color:
                      msg.sender === "user"
                        ? colors.userBubbleText
                        : colors.botBubbleText,
                    border:
                      msg.sender === "bot"
                        ? `1px solid ${colors.botBubbleBorder}`
                        : "none",
                    boxShadow:
                      msg.sender === "user"
                        ? isDark
                          ? "0 4px 16px rgba(10,112,128,0.30)"
                          : "0 4px 16px rgba(10,112,128,0.22)"
                        : isDark
                          ? "0 2px 8px rgba(0,0,0,0.20)"
                          : "0 2px 8px rgba(10,112,128,0.06)",
                    whiteSpace: "pre-wrap",
                    fontFamily: '"Jost", sans-serif',
                    fontSize: "0.875rem",
                    fontWeight: 300,
                    lineHeight: 1.7,
                    letterSpacing: "0.01em",
                  }}
                >
                  {msg.text}
                </Box>

                {msg.sender === "user" && (
                  <Avatar
                    sx={{
                      width: 28,
                      height: 28,
                      background: colors.avatarUserBg,
                      flexShrink: 0,
                      mb: 0.3,
                    }}
                  >
                    <PersonIcon sx={{ fontSize: 15, color: "#FFFFFF" }} />
                  </Avatar>
                )}
              </Box>
            ))}

            {isLoading && (
              <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1 }}>
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    bgcolor: colors.avatarBotBg,
                    flexShrink: 0,
                    mb: 0.3,
                    border: `1.5px solid ${isDark ? "rgba(20,163,180,0.30)" : "rgba(10,112,128,0.25)"}`,
                  }}
                >
                  <BotIcon sx={{ fontSize: 15, color: "#FFFFFF" }} />
                </Avatar>
                <Box
                  sx={{
                    px: 1.8,
                    py: 1.2,
                    borderRadius: "16px 16px 16px 4px",
                    bgcolor: colors.botBubbleBg,
                    border: `1px solid ${colors.botBubbleBorder}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                  }}
                >
                  {[0, 1, 2].map((i) => (
                    <Box
                      key={i}
                      className={`chatbot-typing-dot`}
                      sx={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        bgcolor: colors.accent,
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          <Box
            sx={{
              px: 2,
              py: 1.5,
              bgcolor: colors.inputAreaBg,
              borderTop: `1px solid ${colors.divider}`,
              display: "flex",
              gap: 1,
              alignItems: "flex-end",
            }}
          >
            <TextField
              fullWidth
              size="small"
              multiline
              maxRows={3}
              placeholder="Ask me anything…"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  fontFamily: '"Jost", sans-serif',
                  fontWeight: 300,
                  fontSize: "0.875rem",
                  color: isDark ? "#EEF4FA" : "#1C1208",
                  bgcolor: colors.inputBg,
                  borderRadius: "12px",
                  "& fieldset": {
                    borderColor: colors.inputBorder,
                    transition: "border-color 0.2s ease",
                  },
                  "&:hover fieldset": { borderColor: colors.inputBorderHover },
                  "&.Mui-focused fieldset": {
                    borderColor: colors.inputBorderHover,
                    borderWidth: "1.5px",
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: isDark
                      ? "rgba(238,244,250,0.38)"
                      : "rgba(28,18,8,0.38)",
                    fontStyle: "italic",
                  },
                },
              }}
            />
            <IconButton
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading}
              sx={{
                width: 40,
                height: 40,
                borderRadius: "12px",
                background:
                  !message.trim() || isLoading
                    ? isDark
                      ? "rgba(20,163,180,0.12)"
                      : "rgba(10,112,128,0.10)"
                    : isDark
                      ? "linear-gradient(135deg, #14A3B4, #5E78B8)"
                      : "linear-gradient(135deg, #0A7080, #3A5491)",
                color:
                  !message.trim() || isLoading
                    ? isDark
                      ? "rgba(20,163,180,0.40)"
                      : "rgba(10,112,128,0.35)"
                    : "#FFFFFF",
                flexShrink: 0,
                transition: "all 0.22s ease",
                "&:hover:not(:disabled)": {
                  transform: "translateY(-1px)",
                  boxShadow: isDark
                    ? "0 6px 20px rgba(20,163,180,0.35)"
                    : "0 6px 20px rgba(10,112,128,0.30)",
                },
                "&:active:not(:disabled)": { transform: "translateY(0)" },
              }}
            >
              <SendIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Paper>
      </Slide>

      <Box
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 1250,
          display: isMobile && isOpen ? "none" : "block",
        }}
      >
        {fabPulse && !isOpen && (
          <Box
            sx={{
              position: "absolute",
              inset: -6,
              borderRadius: "50%",
              border: `2px solid ${isDark ? "rgba(20,163,180,0.45)" : "rgba(10,112,128,0.40)"}`,
              animation: "chatbot-pulse 2s ease-in-out infinite",
              "@keyframes chatbot-pulse": {
                "0%, 100%": { transform: "scale(1)", opacity: 0.8 },
                "50%": { transform: "scale(1.20)", opacity: 0 },
              },
            }}
          />
        )}
        <Fab
          onClick={() => {
            setIsOpen(!isOpen);
            setFabPulse(false);
          }}
          sx={{
            background: isOpen
              ? isDark
                ? "rgba(20,163,180,0.20)"
                : "rgba(10,112,128,0.18)"
              : isDark
                ? "linear-gradient(135deg, #14A3B4 0%, #5E78B8 100%)"
                : "linear-gradient(135deg, #0A7080 0%, #3A5491 100%)",
            color: isOpen ? (isDark ? "#4ECBD8" : "#0A7080") : "#FFFFFF",
            width: 58,
            height: 58,
            border: isOpen
              ? `1.5px solid ${isDark ? "rgba(20,163,180,0.40)" : "rgba(10,112,128,0.35)"}`
              : "none",
            boxShadow: isOpen ? "none" : colors.fabGlow,
            transition: "all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
            "&:hover": {
              background: isOpen
                ? isDark
                  ? "rgba(20,163,180,0.28)"
                  : "rgba(10,112,128,0.24)"
                : isDark
                  ? "linear-gradient(135deg, #4ECBD8 0%, #8FA3D6 100%)"
                  : "linear-gradient(135deg, #0E9AAE 0%, #5E78B8 100%)",
              transform: "scale(1.08)",
              boxShadow: isOpen
                ? "none"
                : isDark
                  ? "0 10px 40px rgba(20,163,180,0.55)"
                  : "0 10px 40px rgba(10,112,128,0.48)",
            },
          }}
        >
          <Box
            sx={{
              transition:
                "transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.2s",
              transform: isOpen
                ? "rotate(90deg) scale(0.9)"
                : "rotate(0deg) scale(1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isOpen ? (
              <CloseIcon sx={{ fontSize: 22 }} />
            ) : (
              <ChatIcon sx={{ fontSize: 24 }} />
            )}
          </Box>
        </Fab>
      </Box>
    </>
  );
};
