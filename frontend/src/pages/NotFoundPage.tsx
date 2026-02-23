import { Box, Typography, Button } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isLight = theme.palette.mode === "light";

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.palette.background.default,
        position: "relative",
        overflow: "hidden",
        px: 3,
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: isLight
            ? "radial-gradient(circle, rgba(10,112,128,0.07) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(20,163,180,0.08) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          top: 80,
          right: 120,
          width: 180,
          height: 180,
          borderRadius: "50%",
          border: `1px solid ${
            isLight ? "rgba(184,148,90,0.18)" : "rgba(184,148,90,0.12)"
          }`,
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          bottom: 100,
          left: 80,
          width: 100,
          height: 100,
          borderRadius: "50%",
          border: `1px solid ${
            isLight ? "rgba(10,112,128,0.14)" : "rgba(20,163,180,0.12)"
          }`,
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          textAlign: "center",
          maxWidth: 560,
        }}
      >
        <Typography
          sx={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontWeight: 300,
            fontSize: { xs: "7rem", md: "10rem" },
            lineHeight: 1,
            letterSpacing: "-0.04em",
            color: isLight
              ? "rgba(10, 112, 128, 0.46)"
              : "rgba(20, 164, 180, 0.53)",
            userSelect: "none",
            mb: -2,
          }}
        >
          404
        </Typography>

        <Box
          sx={{
            width: 48,
            height: 1,
            background: isLight
              ? "linear-gradient(90deg, #B8945A, #D4AE72)"
              : "linear-gradient(90deg, #B8945A, #EDD9A3)",
            mx: "auto",
            mb: 3,
          }}
        />

        <Typography
          variant="h3"
          sx={{
            fontFamily: '"Cormorant Garamond", Georgia, serif',
            fontWeight: 400,
            fontSize: { xs: "1.8rem", md: "2.4rem" },
            color: theme.palette.text.primary,
            mb: 2,
            letterSpacing: "0.01em",
          }}
        >
          Page Not Found
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: theme.palette.text.secondary,
            fontSize: "0.92rem",
            fontWeight: 300,
            letterSpacing: "0.03em",
            mb: 5,
            lineHeight: 1.9,
          }}
        >
          The page you're looking for doesn't exist or has been moved.
          <br />
          Let's get you back on track.
        </Typography>

        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/")}
            sx={{ px: 4, py: 1.2 }}
          >
            Go Home
          </Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => navigate(-1)}
            sx={{ px: 4, py: 1.2 }}
          >
            Go Back
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          position: "absolute",
          bottom: 32,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <Box
          sx={{
            width: 20,
            height: 1,
            backgroundColor: isLight
              ? "rgba(10,112,128,0.25)"
              : "rgba(20,163,180,0.25)",
          }}
        />

        <Box
          sx={{
            width: 20,
            height: 1,
            backgroundColor: isLight
              ? "rgba(10,112,128,0.25)"
              : "rgba(20,163,180,0.25)",
          }}
        />
      </Box>
    </Box>
  );
};

export default NotFoundPage;
