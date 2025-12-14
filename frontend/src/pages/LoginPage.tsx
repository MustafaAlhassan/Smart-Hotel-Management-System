import RoomPic from "../assets/Room.jpg";
import React, { useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Container,
  FormControl,
  IconButton,
  InputLabel,
  OutlinedInput,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import hotelPic from "../assets/Hotel.jpg";
import logo from "../assets/Logo.png";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const LoginPage = () => {
  // These Hooks For Password Text Field For Handling Show And Hide Password.
  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleMouseDownPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
  };
  // End Password Field Codes.

  // Start Mustafa Back-End Work.

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

      navigate("/dashboard");
    } catch {
      setError("Server error, please try again later");
    }
  };
  // End Mustafa Back-End Work.

  return (
    <Container
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundImage: `url(${hotelPic})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        minWidth: "100%",
      }}
    >
      <Container
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <Box
          sx={{
            display: {
              xs: "none",
              lg: "flex",
              background: `linear-gradient(rgba(51, 51, 51, 0.6), rgba(0, 0, 0, 0.7)), url("${RoomPic}")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              color: "#fff",
              padding: "40px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              minHeight: "600px",
              borderRadius: "25px 0 0 25px",
              width: "500px",
            },
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom>
            AMI The Best Choise For Better Comfort
          </Typography>
          <Typography variant="h6" gutterBottom>
            ✨ More Than 100 Global Certificates
          </Typography>
          <Typography variant="h6" gutterBottom>
            🎨 Modern Design
          </Typography>
          <Typography variant="h6" gutterBottom>
            🚀 Fast Services
          </Typography>
        </Box>
        <Box
          sx={{
            padding: "40px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#fff",
            height: "600px",
            borderRadius: {
              xs: "25px 25px 25px 25px",
              lg: "0 25px 25px 0",
            },
          }}
        >
          <Avatar
            src={logo}
            variant="square"
            sx={{ mb: "50px", width: "100px", height: "100px" }}
          ></Avatar>
          <Typography
            variant="h4"
            component="h2"
            gutterBottom
            sx={{ textAlign: "center" }}
          >
            Welcome To AMI
          </Typography>
          <form onSubmit={onSubmit}>
            <TextField
              fullWidth
              label="Email"
              name="email"
              type="email"
              inputRef={identifierRef}
              required
              margin="normal"
            />
            <FormControl sx={{ mt: "10px", width: "100%" }} variant="outlined">
              <InputLabel htmlFor="outlined-adornment-password">
                Password
              </InputLabel>
              <OutlinedInput
                inputRef={passwordRef}
                id="outlined-adornment-password"
                type={showPassword ? "text" : "password"}
                endAdornment={
                  <IconButton
                    aria-label={
                      showPassword
                        ? "hide the password"
                        : "display the password"
                    }
                    onClick={handleClickShowPassword}
                    onMouseDown={handleMouseDownPassword}
                    onMouseUp={handleMouseUpPassword}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                }
                label="Password"
              />
            </FormControl>
            <Typography
              variant="body2"
              color="primary"
              sx={{ cursor: "pointer", mt: 1, mb: 2 }}
            >
              Forgot Password?
            </Typography>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              type="submit"
              size="large"
              sx={{ mb: 2 }}
            >
              Log In
            </Button>
          </form>
          {error && (
            <Typography
              sx={{ color: "red", fontSize: "14px", textAlign: "center" }}
            >
              {error}
            </Typography>
          )}
        </Box>
      </Container>
    </Container>
  );
};

export default LoginPage;
