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
  CircularProgress,
} from "@mui/material";
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
} from "@mui/icons-material";

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<
    { sender: "user" | "bot"; text: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isOpen]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message;
    setChatHistory((prev) => [...prev, { sender: "user", text: userMessage }]);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
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

  return (
    <>
      <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>
        <Paper
          elevation={12}
          sx={{
            position: "fixed",
            bottom: 90,
            right: 20,
            width: 380,
            height: 550,
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            borderRadius: 4,
            bgcolor: "#132F4C",
            border: "1px solid #4FB5C3",
          }}
        >
          <Box
            sx={{
              p: 2,
              bgcolor: "#0F263E",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderBottom: "1px solid rgba(79, 181, 195, 0.3)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar sx={{ bgcolor: "#4FB5C3", width: 36, height: 36 }}>
                <BotIcon sx={{ fontSize: 22, color: "#0F263E" }} />
              </Avatar>
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight="bold"
                  color="white"
                  lineHeight={1.2}
                >
                  AMI AI
                </Typography>
                <Typography variant="caption" color="#4FB5C3">
                  Online
                </Typography>
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={() => setIsOpen(false)}
              sx={{ color: "grey.400", "&:hover": { color: "white" } }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Box
            sx={{
              flex: 1,
              p: 2,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              bgcolor: "#132F4C",
            }}
          >
            {chatHistory.length === 0 && (
              <Box
                sx={{
                  mt: 8,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  opacity: 0.8,
                }}
              >
                <BotIcon sx={{ fontSize: 60, color: "#4FB5C3", mb: 2 }} />
                <Typography
                  variant="body1"
                  color="white"
                  align="center"
                  fontWeight="medium"
                >
                  Welcome to AMI hotel system!
                </Typography>
                <Typography variant="body2" color="#B0C4DE" align="center">
                  Ask me about room availability, prices, or amenities.
                </Typography>
              </Box>
            )}

            {chatHistory.map((msg, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent:
                    msg.sender === "user" ? "flex-end" : "flex-start",
                  alignItems: "flex-end",
                  gap: 1,
                }}
              >
                {msg.sender === "bot" && (
                  <Avatar sx={{ width: 28, height: 28, bgcolor: "#1E4976" }}>
                    <BotIcon sx={{ fontSize: 16, color: "#4FB5C3" }} />
                  </Avatar>
                )}

                <Box
                  sx={{
                    maxWidth: "85%",
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: msg.sender === "user" ? "#4FB5C3" : "#1E4976",
                    color: msg.sender === "user" ? "#0F263E" : "#E0E0E0",
                    borderTopRightRadius: msg.sender === "user" ? 0 : 16,
                    borderTopLeftRadius: msg.sender === "bot" ? 0 : 16,
                    boxShadow: 2,
                    whiteSpace: "pre-wrap",
                    fontSize: "0.95rem",
                    lineHeight: 1.6,
                  }}
                >
                  {msg.text}
                </Box>

                {msg.sender === "user" && (
                  <Avatar sx={{ width: 28, height: 28, bgcolor: "#4FB5C3" }}>
                    <PersonIcon sx={{ fontSize: 18, color: "#0F263E" }} />
                  </Avatar>
                )}
              </Box>
            ))}

            {isLoading && (
              <Box
                sx={{ display: "flex", justifyContent: "flex-start", ml: 5 }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: "#1E4976",
                    borderTopLeftRadius: 0,
                  }}
                >
                  <CircularProgress size={16} sx={{ color: "#4FB5C3" }} />
                </Box>
              </Box>
            )}
            <div ref={messagesEndRef} />
          </Box>

          <Box
            sx={{
              p: 2,
              bgcolor: "#0F263E",
              borderTop: "1px solid rgba(79, 181, 195, 0.2)",
              display: "flex",
              gap: 1,
            }}
          >
            <TextField
              fullWidth
              size="small"
              placeholder="Type your message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isLoading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "white",
                  bgcolor: "#132F4C",
                  borderRadius: 2,
                  "& fieldset": { borderColor: "rgba(79, 181, 195, 0.3)" },
                  "&:hover fieldset": { borderColor: "#4FB5C3" },
                  "&.Mui-focused fieldset": { borderColor: "#4FB5C3" },
                },
              }}
            />
            <IconButton
              onClick={handleSendMessage}
              disabled={!message.trim() || isLoading}
              sx={{
                bgcolor: "#4FB5C3",
                color: "#0F263E",
                borderRadius: 2,
                "&:hover": { bgcolor: "#3DA0AC" },
                "&.Mui-disabled": {
                  bgcolor: "rgba(79, 181, 195, 0.3)",
                  color: "#132F4C",
                },
              }}
            >
              <SendIcon />
            </IconButton>
          </Box>
        </Paper>
      </Slide>

      <Fab
        onClick={() => setIsOpen(!isOpen)}
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          bgcolor: "#4FB5C3",
          color: "#0F263E",
          width: 60,
          height: 60,
          "&:hover": { bgcolor: "#3DA0AC" },
          zIndex: 9999,
          boxShadow: "0px 4px 20px rgba(79, 181, 195, 0.4)",
        }}
      >
        {isOpen ? (
          <CloseIcon fontSize="large" />
        ) : (
          <ChatIcon fontSize="large" />
        )}
      </Fab>
    </>
  );
};
