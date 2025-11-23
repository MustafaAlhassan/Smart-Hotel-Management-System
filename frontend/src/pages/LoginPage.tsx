import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const [error, setError] = useState("");

  const identifierRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const identifier = identifierRef.current?.value;
    const password = passwordRef.current?.value;

    if (!identifier || !password) {
      setError("Please check submitted data");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Unable to login user");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("username", data.username);

      navigate("/");
    } catch {
      setError("Server error, please try again later");
    }
  };

  return (
    <Container
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <Box
        component="form"
        onSubmit={onSubmit}
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          width: "300px",
          p: 3,
          boxShadow: 3,
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" textAlign="center">
          Login
        </Typography>

        <TextField
          label="Email or Username"
          variant="filled"
          inputRef={identifierRef}
        />
        <TextField
          label="Password"
          type="password"
          variant="filled"
          inputRef={passwordRef}
        />

        <Button variant="contained" type="submit">
          Login
        </Button>

        {error && (
          <Typography
            sx={{ color: "red", fontSize: "14px", textAlign: "center" }}
          >
            {error}
          </Typography>
        )}
      </Box>
    </Container>
  );
};

export default LoginPage;
