import { UserModel } from "../models/userModel";

export const findUserProfile = async (userId: string) => {
  const user = await UserModel.findById(userId).select("-password");
  return user;
};
