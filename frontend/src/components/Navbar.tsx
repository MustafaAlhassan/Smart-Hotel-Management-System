import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Navbar = () => {

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("role");
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  }
  return (
    <>
      <Button variant="outlined" onClick={handleLogout}>Logout</Button>
    </>
  );
};

export default Navbar;
