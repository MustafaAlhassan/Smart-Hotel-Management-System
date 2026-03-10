import { Request, Response } from "express";
import { UserModel, UserRole } from "../models/userModel";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const createToken = (id: string, role: string) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in .env file");
  }
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "300d" });
};

export const loginUser = async (req: Request, res: Response) => {
  const { identifier, password } = req.body;
  try {
    const user = await UserModel.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).json({ error: "Invalid Email or Password" });
    }

    const token = createToken(user._id.toString(), user.role);
    res.status(200).json({ token, username: user.username, role: user.role });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Error, please try later" });
  }
};

export const signupUser = async (req: Request, res: Response) => {
  const { firstName, lastName, username, email, password } = req.body;

  try {
    const userCount = await UserModel.countDocuments({});

    if (userCount > 0) {
      return res.status(403).json({
        error:
          "System is already initialized. Please contact the Admin to create an account.",
      });
    }
    const exists = await UserModel.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res
        .status(400)
        .json({ error: "Email or Username already in use" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await UserModel.create({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      role: UserRole.ADMIN,
    });

    const token = createToken(user._id.toString(), user.role);
    res.status(201).json({ email, username, role: user.role, token });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const createUser = async (req: Request, res: Response) => {
  const { firstName, lastName, username, email, password, role } = req.body;

  try {
    if (role === UserRole.ADMIN) {
      return res
        .status(403)
        .json({ error: "Cannot create another Admin account." });
    }
    const exists = await UserModel.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res
        .status(400)
        .json({ error: "Email or Username already in use" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await UserModel.create({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      role: role || UserRole.HOUSEKEEPING,
    });

    res.status(201).json({
      message: "User created successfully",
      user: { email, username, role: newUser.role },
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateUserRole = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { newRole } = req.body;

  try {
    if (!Object.values(UserRole).includes(newRole)) {
      return res.status(400).json({ error: "Invalid Role" });
    }

    if (newRole === UserRole.ADMIN) {
      return res
        .status(400)
        .json({ error: "Cannot assign Admin role. Only one Admin allowed." });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      { role: newRole },
      { new: true },
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    res
      .status(200)
      .json({ message: "User promoted successfully", user: updatedUser });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await UserModel.find({}).select("-password");
    res.status(200).json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await UserModel.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json(user);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const userReq = (req as any).user;
    if (!userReq) {
      return res.status(401).json({ error: "Not authorized" });
    }
    if (userReq._id === id) {
      return res
        .status(400)
        .json({ error: "You cannot delete your own account" });
    }
    const user = await UserModel.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { firstName, lastName, email, username, isActive } = req.body;

  try {
    const user = await UserModel.findById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.role === UserRole.ADMIN && isActive === false) {
      return res.status(400).json({ error: "Cannot deactivate the Admin account." });
    }

    const existingUser = await UserModel.findOne({
      $and: [{ _id: { $ne: id } }, { $or: [{ email }, { username }] }],
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Email or Username already in use by another user" });
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      id,
      {
        firstName,
        lastName,
        email,
        username,
        ...(isActive !== undefined && { isActive }),
      },
      { new: true, runValidators: true },
    ).select("-password");

    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const resetUserPassword = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  try {
    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const user = await UserModel.findByIdAndUpdate(
      id,
      { password: hashedPassword },
      { new: true },
    );

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const changeMyPassword = async (req: Request, res: Response) => {
  const userId = (req as any).user._id;

  const { oldPassword, newPassword } = req.body;

  try {
    if (!oldPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Please provide both old and new passwords" });
    }

    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect old password" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(newPassword, salt);

    user.password = hash;
    await user.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};